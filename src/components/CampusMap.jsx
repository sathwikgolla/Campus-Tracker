import { useState } from "react";
import { faculty } from "../data/faculty";
import { LiveStatusBadge } from "./LiveStatusBadge";
import { Card } from "./ui/Card";

const blocks = [
  ["Block A", 40, 40, "CSE / IT"], ["Block B", 260, 60, "ECE"], ["Block C", 500, 50, "EEE"],
  ["Library", 150, 240, "Study"], ["Labs", 390, 230, "AIML / DS"], ["Staff Rooms", 610, 210, "Faculty"],
  ["Admin Office", 300, 390, "Admin"],
];

export function CampusMap() {
  const [selected, setSelected] = useState(faculty[0]);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
      <Card hover={false} className="overflow-auto p-5">
        <svg viewBox="0 0 780 520" className="min-w-[720px]">
          <defs><linearGradient id="mapg" x1="0" x2="1"><stop stopColor="#7C3AED" /><stop offset="1" stopColor="#06B6D4" /></linearGradient></defs>
          <rect width="780" height="520" rx="28" fill="rgba(255,255,255,0.03)" />
          {blocks.map(([name, x, y, label]) => (
            <g key={name} onClick={() => setSelected(faculty.find((item) => item.location?.includes(name.split(" ")[1])) || faculty[0])} className="cursor-pointer">
              <rect x={x} y={y} width="150" height="90" rx="18" fill="rgba(124,58,237,.16)" stroke="rgba(6,182,212,.45)" />
              <text x={x + 20} y={y + 38} fill="#fff" fontSize="18" fontWeight="800">{name}</text>
              <text x={x + 20} y={y + 62} fill="#94A3B8" fontSize="12">{label}</text>
            </g>
          ))}
          <path d="M115 130 C180 190, 260 220, 335 420" stroke="url(#mapg)" strokeWidth="5" fill="none" strokeDasharray="10 10" />
          <circle cx="115" cy="130" r="9" fill="#06B6D4" />
          <circle cx="335" cy="420" r="9" fill="#8B5CF6" />
        </svg>
      </Card>
      <Card className="p-5">
        <img src={selected.avatar} alt={selected.name} className="h-20 w-20 rounded-3xl object-cover" />
        <h3 className="mt-4 text-xl font-black text-white">{selected.name}</h3>
        <p className="text-sm text-slateText">{selected.department} · {selected.cabin}</p>
        <div className="mt-4"><LiveStatusBadge status={selected.status} /></div>
        <p className="mt-4 text-sm text-slateText">Route highlighted to {selected.cabin}. Contact from faculty card or book an appointment.</p>
      </Card>
    </div>
  );
}
