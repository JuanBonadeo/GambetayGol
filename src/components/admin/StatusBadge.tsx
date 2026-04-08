type BadgeVariant = "active" | "inactive" | "offer-active" | "offer-expired" | "bajo-pedido";

const styles: Record<BadgeVariant, string> = {
  active: "bg-green-950 text-green-400 border border-green-900/50",
  inactive: "bg-gray-800 text-gray-400 border border-gray-700/50",
  "offer-active": "bg-sky-950 text-sky-300 border border-sky-900/50",
  "offer-expired": "bg-red-950 text-red-400 border border-red-900/50",
  "bajo-pedido": "bg-yellow-950 text-yellow-400 border border-yellow-900/50",
};

const defaultLabels: Record<BadgeVariant, string> = {
  active: "Activo",
  inactive: "Inactivo",
  "offer-active": "Vigente",
  "offer-expired": "Expirada",
  "bajo-pedido": "Bajo pedido",
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant]}`}>
      {label ?? defaultLabels[variant]}
    </span>
  );
}
