import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { statusStyles } from "../data/faculty";

export function FacultyCard({ member, compact = false }) {
  return (
    <Card className="group p-5">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0 overflow-hidden rounded-3xl">
          <img src={member.avatar} alt={member.name} className="h-16 w-16 object-cover transition duration-500 group-hover:scale-110" />
          <span className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-panel ${member.status === "Available" ? "bg-emerald-400" : member.status === "Busy" ? "bg-amber-400" : member.status === "In Class" ? "bg-cyan" : "bg-rose-400"}`} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-white">{member.name}</h3>
          <p className="text-sm text-slateText">{member.designation}</p>
          <p className="mt-1 text-xs font-semibold text-cyan">{member.department}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-slateText">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violetSoft" />{member.cabin}</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[member.status]}`}>{member.status}</span>
          <span className="text-xs text-muted">{member.timings}</span>
        </div>
        {!compact && (
          <>
            <div className="flex items-start gap-2"><UserRound className="mt-0.5 h-4 w-4 text-cyan" /><span>{member.subjects.join(", ")}</span></div>
            <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 text-violetSoft" />{member.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan" />{member.phone}</div>
          </>
        )}
      </div>
      {!compact && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" className="py-2.5">View Details</Button>
          <Button className="py-2.5">Contact</Button>
        </div>
      )}
    </Card>
  );
}
