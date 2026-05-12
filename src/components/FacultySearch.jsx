import { Lock, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { departmentsList, faculty, locationsList, statusesList } from "../data/faculty";
import { FacultyCard } from "./FacultyCard";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input, Select } from "./ui/Input";

export function FacultySearch({ preview = false }) {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faculty
      .filter((member) => !q || [member.name, member.department, member.cabin, member.location, member.status, member.email, ...member.subjects].join(" ").toLowerCase().includes(q))
      .filter((member) => !department || member.department === department)
      .filter((member) => !status || member.status === status)
      .filter((member) => !location || member.location === location)
      .slice(0, preview ? 6 : 12);
  }, [department, location, preview, query, status]);

  const visibleResults = isAuthenticated ? results : faculty.slice(0, 6);

  return (
    <div id="search" className="scroll-mt-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">Faculty Search</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Search Faculty Instantly</h2>
        <p className="mt-4 text-base leading-7 text-slateText">Find professors by name, subject, department, location or availability.</p>
      </div>
      <div className="glass mt-10 rounded-3xl p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_150px_150px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <Input disabled={!isAuthenticated} value={query} onChange={(e) => setQuery(e.target.value)} className="h-14 pl-12 disabled:cursor-not-allowed disabled:opacity-55" placeholder="Search faculty by name, subject, department or cabin..." />
          </div>
          <Select disabled={!isAuthenticated} value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">Department</option>{departmentsList.map((d) => <option key={d}>{d}</option>)}</Select>
          <Select disabled={!isAuthenticated} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Status</option>{statusesList.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select disabled={!isAuthenticated} value={location} onChange={(e) => setLocation(e.target.value)}><option value="">Location</option>{locationsList.map((l) => <option key={l}>{l}</option>)}</Select>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between text-sm text-slateText">
        <span>{isAuthenticated ? `Showing ${results.length} faculty matches` : "Smart search is protected"}</span>
        <span className="hidden text-muted sm:inline">{isAuthenticated ? "Live campus availability feed" : "Login required for live results"}</span>
      </div>
      <div className="relative mt-5">
        {isAuthenticated && results.length === 0 ? (
          <Card className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan/25 bg-cyan/10 shadow-cyanGlow">
                <Sparkles className="h-7 w-7 text-cyan" />
              </div>
              <h3 className="mt-5 text-xl font-black text-white">No matching faculty found.</h3>
              <p className="mt-2 text-sm text-slateText">Try changing search keywords or filters.</p>
            </div>
          </Card>
        ) : (
          <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${!isAuthenticated ? "pointer-events-none blur-[3px] brightness-75" : ""}`}>
            {visibleResults.map((member) => <FacultyCard key={member.id} member={member} />)}
          </div>
        )}
        {!isAuthenticated && (
          <div className="absolute inset-0 grid place-items-center rounded-3xl bg-night/55 p-4 backdrop-blur-md">
            <div className="glass max-w-md rounded-3xl p-7 text-center shadow-glow">
              <div className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-3xl border border-violetSoft/30 bg-violet/20">
                <Lock className="h-7 w-7 text-cyan" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Login to access smart faculty search</h3>
              <p className="mt-3 text-sm leading-6 text-slateText">Faculty cards, live availability, filters, and contact details are available only after authentication.</p>
              <Link to="/auth"><Button className="mt-6">Login Now</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
