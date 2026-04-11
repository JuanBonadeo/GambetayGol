export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProducts,
      totalClubs,
      totalLigas,
      activeOffers,
      recentProducts,
      currentOffers,
      totalOrders,
      pendingOrders,
      ventasMes,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.club.count(),
      prisma.liga.count(),
      prisma.offer.count({
        where: { deletedAt: null, activo: true, desde: { lte: now }, hasta: { gte: now } },
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
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDIENTE" } }),
      prisma.order.aggregate({
        where: {
          status: { in: ["CONFIRMADA", "ENTREGADA"] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              variant: { include: { product: { select: { nombre: true } } } },
              product: { select: { nombre: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        totalProducts,
        totalClubs,
        totalLigas,
        activeOffers,
        recentProducts,
        currentOffers,
        totalOrders,
        pendingOrders,
        ventasMes: ventasMes._sum.total ?? 0,
        recentOrders,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
