import { MapPin } from "lucide-react";

export function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-violet/20 shadow-glow">
        <MapPin className="h-5 w-5 text-cyan" />
        <span className="absolute inset-0 rounded-2xl border border-cyan/25" />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-lg font-black tracking-tight text-white">
            Campus<span className="aurora-text">Tracker</span>
          </div>
          <div className="mt-1 text-[11px] font-medium text-slateText">Find. Connect. Learn.</div>
        </div>
      )}
    </div>
  );
}
