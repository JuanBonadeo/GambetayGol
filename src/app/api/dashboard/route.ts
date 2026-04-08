export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const [totalProducts, totalClubs, totalLigas, activeOffers, recentProducts, currentOffers] =
      await Promise.all([
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.club.count(),
        prisma.liga.count(),
        prisma.offer.count({
          where: { deletedAt: null, activo: true, desde: { lte: now }, hasta: { gte: now } }
        }),
        prisma.product.findMany({
          where: { deletedAt: null },
          include: { club: true, images: { where: { esPrincipal: true }, take: 1 } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.offer.findMany({
          where: { deletedAt: null, activo: true },
          include: { product: true },
          orderBy: { hasta: "asc" },
          take: 5,
        }),
      ]);

    return NextResponse.json({
      data: { totalProducts, totalClubs, totalLigas, activeOffers, recentProducts, currentOffers }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
