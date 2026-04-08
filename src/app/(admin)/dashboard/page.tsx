export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [totalProducts, totalClubs, totalLigas, activeOffers] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.club.count(),
    prisma.liga.count(),
    prisma.offer.count({ where: { deletedAt: null, activo: true } })
  ]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Productos" value={totalProducts} />
        <StatCard title="Clubes" value={totalClubs} />
        <StatCard title="Ligas" value={totalLigas} />
        <StatCard title="Ofertas Activas" value={activeOffers} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-[#111] p-6 rounded-lg border border-gray-800 shadow-sm">
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm font-medium text-gray-400">{title}</div>
    </div>
  );
}
