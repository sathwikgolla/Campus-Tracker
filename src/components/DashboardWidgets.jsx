import { motion } from "framer-motion";
import { BarChart3, Bell, CalendarCheck, MapPin, Search, UsersRound } from "lucide-react";
import { faculty, statusStyles } from "../data/faculty";
import { Logo } from "./Logo";
import { Card } from "./ui/Card";

export function MetricCard({ icon: Icon, value, label, tone = "text-cyan" }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-black ${tone}`}>{value}</div>
          <div className="mt-1 text-sm text-slateText">{label}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <Icon className={`h-5 w-5 ${tone}`} />
        </div>
      </div>
    </Card>
  );
}

export function FacultyTable({ limit = 8 }) {
  return (
    <Card hover={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <h3 className="font-bold text-white">Faculty Availability</h3>
        <span className="text-sm text-cyan">Live</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-muted">
            <tr className="border-b border-white/10">
              <th className="px-5 py-4">Faculty</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Cabin</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Timings</th>
            </tr>
          </thead>
          <tbody>
            {faculty.slice(0, limit).map((member) => (
              <tr key={member.id} className="border-b border-white/[0.06] text-slateText transition hover:bg-white/[0.035]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar} alt="" className="h-10 w-10 rounded-2xl object-cover" />
                    <span className="font-semibold text-white">{member.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">{member.department}</td>
                <td className="px-5 py-4">{member.cabin}</td>
                <td className="px-5 py-4"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[member.status]}`}>{member.status}</span></td>
                <td className="px-5 py-4">{member.timings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function DashboardPreview() {
  const activities = ["Dr. Mira Iyer updated cabin Block B-102", "AIML faculty added three office-hour slots", "ECE department marked review sessions live"];
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="grid lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-white/10 bg-panel/65 p-5 lg:border-b-0 lg:border-r">
          <Logo />
          <div className="mt-7 grid gap-2">
            {["Dashboard", "Search Faculty", "My Favorites", "Notifications", "Settings", "Logout"].map((item, i) => (
              <div key={item} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${i === 0 ? "bg-violet/18 text-white" : "text-slateText"}`}>
                {i === 0 ? <BarChart3 className="h-4 w-4" /> : i === 1 ? <Search className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-white">Good afternoon, Alex</h3>
              <p className="mt-1 text-sm text-slateText">Campus activity is moving smoothly today.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cyan">Realtime sync</div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={UsersRound} value="42" label="Faculty Available" />
            <MetricCard icon={CalendarCheck} value="12" label="Upcoming Classes" tone="text-violetSoft" />
            <MetricCard icon={MapPin} value="8" label="Blocks Active" tone="text-emerald-300" />
            <MetricCard icon={Bell} value="19" label="Notifications" tone="text-rose-300" />
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px]">
            <FacultyTable limit={5} />
            <div className="grid gap-4">
              <Card className="p-5">
                <h4 className="font-bold text-white">Recent Activity</h4>
                <div className="mt-4 grid gap-3">
                  {activities.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slateText">{item}</div>)}
                </div>
              </Card>
              <Card className="p-5">
                <h4 className="font-bold text-white">Availability Pulse</h4>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {[48, 72, 58, 92, 68, 84, 61].map((h, i) => <motion.span key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} className="flex-1 rounded-t-xl bg-gradient-to-t from-violet to-cyan" />)}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
