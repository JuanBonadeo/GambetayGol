export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClubSchema } from "@/lib/validations/club";

export async function GET() {
  try {
    const data = await prisma.club.findMany({
      include: { liga: { include: { pais: true } } },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ClubSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const data = await prisma.club.create({
      data: parsed.data,
      include: { liga: { include: { pais: true } } }
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
