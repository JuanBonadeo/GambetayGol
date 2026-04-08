export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LigaSchema } from "@/lib/validations/liga";

export async function GET() {
  try {
    const data = await prisma.liga.findMany({
      include: { pais: true, clubes: true },
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
    const parsed = LigaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const data = await prisma.liga.create({
      data: parsed.data,
      include: { pais: true, clubes: true }
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
