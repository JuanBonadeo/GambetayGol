import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfferSchema } from "@/lib/validations/offer";

export async function GET() {
  try {
    const data = await prisma.offer.findMany({
      where: { deletedAt: null },
      include: { product: true, variant: true },
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
    const parsed = OfferSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const data = await prisma.offer.create({
      data: parsed.data,
      include: { product: true, variant: true }
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
