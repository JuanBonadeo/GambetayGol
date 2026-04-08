import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfferSchema } from "@/lib/validations/offer";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.offer.findUnique({
      where: { id: params.id, deletedAt: null },
      include: { product: true, variant: true }
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
    const parsed = OfferSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const data = await prisma.offer.update({
      where: { id: params.id },
      data: parsed.data,
      include: { product: true, variant: true }
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.offer.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
