export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const OrderItemInputSchema = z.union([
  z.object({
    esEncargo: z.literal(false).optional().default(false),
    variantId: z.string().min(1),
    precio: z.number().min(0),
    cantidad: z.number().int().min(1),
  }),
  z.object({
    esEncargo: z.literal(true),
    productId: z.string().min(1),
    talla: z.string().min(1),
    precio: z.number().min(0),
    cantidad: z.number().int().min(1),
  }),
]);

const CreateOrderSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().optional().nullable(),
  tipoEnvio: z.enum(["ROSARIO", "ANDREANI_SUCURSAL", "ANDREANI_DOMICILIO"]),
  items: z.array(OrderItemInputSchema).min(1),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const data = await prisma.order.findMany({
      where: status ? { status: status as any } : {},
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { nombre: true } },
              },
            },
            product: { select: { nombre: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { nombre, telefono, tipoEnvio, items } = parsed.data;
    const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

    const data = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          nombre,
          telefono: telefono ?? null,
          tipoEnvio,
          total,
          items: {
            create: items.map((i) =>
              i.esEncargo
                ? {
                    productId: i.productId,
                    talla: i.talla,
                    esEncargo: true,
                    precio: i.precio,
                    cantidad: i.cantidad,
                  }
                : {
                    variantId: i.variantId,
                    esEncargo: false,
                    precio: i.precio,
                    cantidad: i.cantidad,
                  }
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

      return order;
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}
