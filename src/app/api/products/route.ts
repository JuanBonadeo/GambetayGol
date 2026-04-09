export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validations/product";

export async function GET() {
  try {
    const data = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { club: true, categoria: true, variants: true, images: true, offers: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const { variants, images, ...productData } = parsed.data;

    const data = await prisma.product.create({
      data: {
        ...productData,
        variants: variants ? { create: variants } : undefined,
        images: images ? { create: images } : undefined
      },
      include: { variants: true, images: true }
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
