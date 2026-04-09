export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { nombre } = await req.json();
    if (!nombre?.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    const slug = nombre.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
    const data = await prisma.categoria.update({
      where: { id: params.id },
      data: { nombre: nombre.trim(), slug },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.categoria.delete({ where: { id: params.id } });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
