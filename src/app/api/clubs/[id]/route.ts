export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClubSchema } from "@/lib/validations/club";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.club.findUnique({
      where: { id: params.id },
      include: { pais: true, liga: true }
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
    const parsed = ClubSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation Error", details: parsed.error.format() }, { status: 400 });
    }

    const data = await prisma.club.update({
      where: { id: params.id },
      data: parsed.data,
      include: { pais: true, liga: true }
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.club.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
