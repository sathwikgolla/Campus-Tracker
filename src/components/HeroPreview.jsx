import { motion, useMotionValue, useTransform } from "framer-motion";
import { Bell, Calendar, Search, TrendingUp } from "lucide-react";
import { faculty } from "../data/faculty";

export function HeroPreview() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-160, 160], [8, -8]);
  const rotateY = useTransform(x, [-160, 160], [-8, 8]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="glass premium-border relative mx-auto max-w-xl rounded-3xl p-5 shadow-glow"
    >
      <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/10">
        <Bell className="h-4 w-4 text-cyan" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-400" />
      </div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Live dashboard</p>
        <h3 className="mt-2 text-xl font-bold text-white">Faculty Pulse</h3>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <Search className="h-4 w-4 text-muted" />
        <span className="text-sm text-slateText">Search by name, cabin, schedule...</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["42", "Available", "text-emerald-300"],
          ["18", "In class", "text-cyan"],
          ["7", "Requests", "text-violetSoft"],
        ].map(([value, label, color]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className={`text-xl font-black ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {faculty.slice(0, 3).map((member) => (
          <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <img src={member.avatar} alt="" className="h-11 w-11 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{member.name}</div>
              <div className="text-xs text-slateText">{member.cabin} · {member.department}</div>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(34,197,94,0.8)]" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[1fr_120px] gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><TrendingUp className="h-4 w-4 text-cyan" />Hourly traffic</div>
          <div className="flex h-20 items-end gap-2">
            {[36, 58, 42, 76, 54, 88, 64, 96].map((height, i) => <span key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-violet to-cyan" style={{ height: `${height}%` }} />)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <Calendar className="h-5 w-5 text-violetSoft" />
          <div className="mt-5 text-2xl font-black text-white">12</div>
          <div className="text-xs text-muted">Open slots</div>
        </div>
      </div>
    </motion.div>
  );
}
