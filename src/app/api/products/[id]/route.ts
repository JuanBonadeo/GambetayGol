export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validations/product";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.product.findUnique({
      where: { id: params.id, deletedAt: null },
      include: { club: true, variants: true, images: true, offers: true }
    });
    if (!data) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const { variants, images, ...productData } = parsed.data;
    
    if (variants || images) {
      await prisma.$transaction(async (tx) => {
        if (variants) {
          await tx.productVariant.deleteMany({ where: { productId: params.id } });
          await tx.productVariant.createMany({ data: variants.map(v => ({ ...v, productId: params.id })) });
        }
        if (images) {
          await tx.productImage.deleteMany({ where: { productId: params.id } });
          await tx.productImage.createMany({ data: images.map(i => ({ ...i, productId: params.id })) });
        }
      });
    }

    const data = await prisma.product.update({
      where: { id: params.id },
      data: productData,
      include: { variants: true, images: true }
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
