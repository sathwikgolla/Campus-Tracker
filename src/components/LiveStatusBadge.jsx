import { statusStyles } from "../data/faculty";

export function LiveStatusBadge({ status = "Not Updated" }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles["Not Updated"]}`}>
      <span className="h-2 w-2 rounded-full bg-current shadow-cyanGlow" />
      {status}
    </span>
  );
}
