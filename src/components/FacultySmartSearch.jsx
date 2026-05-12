import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { faculty } from "../data/faculty";
import { AvailabilityPrediction } from "./AvailabilityPrediction";
import { AppointmentBookingModal } from "./AppointmentBookingModal";
import { FavoriteButton } from "./FavoriteButton";
import { LiveStatusBadge } from "./LiveStatusBadge";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

const aliases = {
  dsa: "Data Structures Algorithms",
  sir: "Professor",
  hod: "Professor",
  review: "Project Discussion",
};

export function FacultySmartSearch() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [bookingFaculty, setBookingFaculty] = useState(null);
  const fuse = useMemo(() => new Fuse(faculty, { threshold: 0.35, keys: ["name", "department", "subjects", "cabin", "designation", "status", "location", "email"] }), []);
  const expandedQuery = query.toLowerCase().split(/\s+/).map((word) => aliases[word] || word).join(" ");
  const results = query.trim() ? fuse.search(expandedQuery).map((item) => item.item).slice(0, 12) : faculty.slice(0, 9);
  const suggestions = results.slice(0, 5);
  const departments = [...new Set(results.map((item) => item.department))].slice(0, 5);

  return (
    <div className="grid gap-5">
      <Card hover={false} className="p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-12" placeholder="Try: DSA teacher, available CSE faculty, HOD ECE, Block A faculty..." />
        </div>
        {query && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((item) => <button key={item.id} onClick={() => setQuery(item.name)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slateText">{item.name}</button>)}
            {departments.map((item) => <span key={item} className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">{item}</span>)}
          </div>
        )}
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((member) => (
          <Card key={member.id} className="p-5">
            <div className="flex gap-4">
              <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-3xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-white">{member.name}</h3>
                <p className="text-sm text-slateText">{member.designation} · {member.department}</p>
                <p className="mt-1 text-sm text-cyan">{member.cabin}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><LiveStatusBadge status={member.status} /></div>
            <p className="mt-3 text-sm text-slateText">{member.subjects.join(", ")}</p>
            <div className="mt-4"><AvailabilityPrediction faculty={member} /></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setBookingFaculty(member)} className="rounded-2xl border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm font-semibold text-cyan">Book</button>
              <FavoriteButton compact active={favorites.includes(member.id)} onClick={() => setFavorites((current) => current.includes(member.id) ? current.filter((id) => id !== member.id) : [...current, member.id])} />
            </div>
          </Card>
        ))}
      </div>
      <AppointmentBookingModal faculty={bookingFaculty} open={Boolean(bookingFaculty)} onClose={() => setBookingFaculty(null)} />
    </div>
  );
}
