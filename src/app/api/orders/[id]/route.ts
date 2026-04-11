export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateOrderStatusSchema, UpdateOrderSchema } from "@/lib/validations/order";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ["CONFIRMADA", "CANCELADA"],
  CONFIRMADA: ["ENTREGADA", "CANCELADA"],
  ENTREGADA: [],
  CANCELADA: [],
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    nombre: true,
                    images: { where: { esPrincipal: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!data) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = UpdateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    if (!VALID_TRANSITIONS[order.status].includes(newStatus)) {
      return NextResponse.json(
        { error: `No se puede pasar de ${order.status} a ${newStatus}` },
        { status: 400 }
      );
    }

    // Solo los ítems con stock real (no encargos) afectan el stock
    const stockItems = order.items.filter((i) => !i.esEncargo && i.variantId);

    // PENDIENTE → CONFIRMADA: verificar y descontar stock
    if (newStatus === "CONFIRMADA") {
      for (const item of stockItems) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId! },
          include: { product: { select: { nombre: true } } },
        });
        if (!variant || variant.stock < item.cantidad) {
          return NextResponse.json(
            {
              error: `Stock insuficiente: ${variant?.product?.nombre ?? "producto"} talle ${variant?.talla ?? "?"} — disponible: ${variant?.stock ?? 0}`,
            },
            { status: 400 }
          );
        }
      }

      if (stockItems.length > 0) {
        await prisma.$transaction(
          stockItems.map((i) =>
            prisma.productVariant.update({
              where: { id: i.variantId! },
              data: { stock: { decrement: i.cantidad } },
            })
          )
        );
      }
    }

    // CONFIRMADA → CANCELADA: restaurar stock (solo ítems reales)
    if (newStatus === "CANCELADA" && order.status === "CONFIRMADA" && stockItems.length > 0) {
      await prisma.$transaction(
        stockItems.map((i) =>
          prisma.productVariant.update({
            where: { id: i.variantId! },
            data: { stock: { increment: i.cantidad } },
          })
        )
      );
    }

    const data = await prisma.order.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { nombre: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = UpdateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if (order.status !== "PENDIENTE") {
      return NextResponse.json({ error: "Solo se pueden editar órdenes pendientes" }, { status: 400 });
    }

    const { nombre, telefono, tipoEnvio, items } = parsed.data;
    const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

    const data = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: params.id } });
      return tx.order.update({
        where: { id: params.id },
        data: {
          nombre,
          telefono: telefono ?? null,
          tipoEnvio,
          total,
          items: {
            create: items.map((i) =>
              i.esEncargo
                ? { productId: i.productId, talla: i.talla, esEncargo: true, precio: i.precio, cantidad: i.cantidad }
                : { variantId: i.variantId, esEncargo: false, precio: i.precio, cantidad: i.cantidad }
            ),
          },
        },
        include: {
          items: {
            include: {
              variant: { include: { product: { select: { nombre: true } } } },
              product: { select: { nombre: true } },
            },
          },
        },
      });
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    // Si estaba confirmada, restaurar stock de ítems reales
    if (order.status === "CONFIRMADA") {
      const stockItems = order.items.filter((i) => !i.esEncargo && i.variantId);
      if (stockItems.length > 0) {
        await prisma.$transaction(
          stockItems.map((i) =>
            prisma.productVariant.update({
              where: { id: i.variantId! },
              data: { stock: { increment: i.cantidad } },
            })
          )
        );
      }
    }

    await prisma.order.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}
