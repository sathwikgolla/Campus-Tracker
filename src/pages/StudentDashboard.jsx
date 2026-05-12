import { AnimatePresence, motion } from "framer-motion";
import { Bell, Building2, CheckCircle2, Clock, Eye, Heart, MapPin, Search, Star, UserRound, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";
import { CampusBot } from "../components/CampusBot";
import { BackButton } from "../components/common/BackButton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { NotificationCenter } from "../components/NotificationCenter";
import { departmentsList as fallbackDepartments, locationsList as fallbackLocations, statusStyles, statusesList } from "../data/faculty";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { fetchFaculty } from "../services/facultyService";


const storage = {
  get(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const navMap = {
  Dashboard: "dashboard",
  "Search Faculty": "search",
  Favorites: "favorites",
  Notifications: "notifications",
  Profile: "profile",
};

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => storage.get(key, fallback));
  const update = (next) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      storage.set(key, resolved);
      return resolved;
    });
  };
  return [value, update];
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="fixed right-5 top-24 z-50 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/15 px-5 py-4 text-sm font-semibold text-emerald-200 backdrop-blur-xl">
          <CheckCircle2 className="h-5 w-5" /> {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ title, text }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="grid min-h-56 place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan/25 bg-cyan/10 shadow-cyanGlow">
            <Search className="h-7 w-7 text-cyan" />
          </div>
          <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
          <p className="mt-2 text-sm text-slateText">{text}</p>
        </div>
      </Card>
    </motion.div>
  );
}

function FacultyResultCard({ member, isFavorite, onFavorite, onDetails }) {
  return (
    <Card className="group p-5">
      <div className="flex items-start gap-4">
        <img src={member.avatar || member.image} alt={member.name} className="h-16 w-16 rounded-3xl object-cover transition duration-500 group-hover:scale-105" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-white">{member.name}</h3>
          <p className="text-sm text-slateText">{member.designation}</p>
          <p className="mt-1 text-xs font-semibold text-cyan">{member.department}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[member.status]}`}>{member.status}</span>
      </div>
      <div className="mt-5 grid gap-2 text-sm text-slateText">
        <span><MapPin className="mr-2 inline h-4 w-4 text-violetSoft" />{member.cabin}</span>
        <span>{member.timings}</span>
        <span>{member.subjects.join(", ")}</span>
        <span className="truncate">{member.email}</span>
        <span>{member.phone}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onDetails(member)} className="py-2.5"><Eye className="h-4 w-4" />View Details</Button>
        <Button onClick={() => onFavorite(member.id)} className="py-2.5"><Heart className="h-4 w-4" />{isFavorite ? "Remove" : "Favorite"}</Button>
      </div>
    </Card>
  );
}

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sectionHistory, setSectionHistory] = useState([]);
  const [dashboardQuery, setDashboardQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyData, setFacultyData] = useState([]);
  const [facultyError, setFacultyError] = useState("");
  const [favorites, setFavorites] = usePersistentState("campustracker:student:favorites", []);
  const [recentSearches, setRecentSearches] = usePersistentState("campustracker:student:recent", []);
  const { user, token } = useAuth();
  const { notifications } = useNotifications();
  const [profile, setProfile] = usePersistentState("campustracker:student:profile", {
    fullName: user?.name || "",
    rollNo: "",
    email: user?.email || "",
    branch: "CSE",
    year: "3",
    section: "A",
    phone: "+91 98765 43001",
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
  let alive = true;

  async function loadFaculty() {
    try {
      console.log("TOKEN:", token);

      const data = await fetchFaculty({}, token);

      console.log("FACULTY RESPONSE:", data);

      if (!alive) return;

      setFacultyData(
        data.map((item) => ({
          ...item,
          id: item._id || item.id,
          avatar:
            item.avatar ||
            item.image ||
            `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
              item.name || "Faculty"
            )}&backgroundColor=0f172a,312e81&textColor=06b6d4`,
          image: item.image || item.avatar,
          timings:
            item.availableTime ||
            item.timings ||
            "No timetable available",
          subjects: Array.isArray(item.subjects)
            ? item.subjects
            : String(item.subjects || "")
                .split(",")
                .filter(Boolean),
          cabin: item.cabin || item.location || "Cabin not assigned",
          location:
            item.location || item.cabin || "Cabin not assigned",
          status:
            item.status ||
            item.liveStatus?.status ||
            "Not Updated",
        }))
      );

      setFacultyError("");
    } catch (error) {
      console.error("FACULTY ERROR:", error);

      if (!alive) return;

      setFacultyData([]);
      setFacultyError(
        error.message || "Unable to load faculty from backend"
      );
    }
  }

  if (token && token !== "undefined" && token !== "null") {
    loadFaculty();
  }

  return () => {
    alive = false;
  };
}, [token]);

  const activeLabel = Object.entries(navMap).find(([, value]) => value === activeSection)?.[0] || "Dashboard";
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const favoriteFaculty = useMemo(() => facultyData.filter((member) => favoriteSet.has(member.id)), [facultyData, favoriteSet]);
  const availableCount = useMemo(() => facultyData.filter((member) => member.status === "Available").length, [facultyData]);
  const departmentsCount = useMemo(() => new Set(facultyData.map((member) => member.department).filter(Boolean)).size, [facultyData]);
  const unreadCount = useMemo(() => notifications.filter((item) => (item.role === "student" || item.userId === user?.id) && !item.isRead).length, [notifications, user?.id]);
  const departmentsList = useMemo(() => {
    const values = [...new Set(facultyData.map((member) => member.department).filter(Boolean))].sort();
    return values.length ? values : fallbackDepartments;
  }, [facultyData]);
  const locationsList = useMemo(() => {
    const values = [...new Set(facultyData.map((member) => member.location || member.cabin).filter(Boolean))].sort();
    return values.length ? values : fallbackLocations;
  }, [facultyData]);
  const departmentStats = useMemo(() => (departmentsList.length ? departmentsList : fallbackDepartments).map((department) => {
    const members = facultyData.filter((member) => member.department === department);
    return {
      department,
      total: members.length,
      available: members.filter((member) => member.status === "Available").length,
      busy: members.filter((member) => member.status === "Busy").length,
    };
  }), [departmentsList, facultyData]);

  const navigateSection = (section) => {
    setActiveSection((current) => {
      if (current === section) return current;
      setSectionHistory((history) => [...history, current].slice(-12));
      return section;
    });
  };

  const goBackSection = () => {
    setSectionHistory((history) => {
      const previous = history.at(-1) || "dashboard";
      setActiveSection(previous);
      return history.slice(0, -1);
    });
  };

  const filteredTable = useMemo(() => {
    const q = dashboardQuery.trim().toLowerCase();
    return facultyData.filter((member) => !q || [member.name, member.department, member.cabin, member.status, member.email, ...member.subjects].join(" ").toLowerCase().includes(q)).slice(0, 8);
  }, [dashboardQuery]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return facultyData
      .filter((member) => !q || [member.name, member.department, member.cabin, member.status, member.email, ...member.subjects].join(" ").toLowerCase().includes(q))
      .filter((member) => !departmentFilter || member.department === departmentFilter)
      .filter((member) => !statusFilter || member.status === statusFilter)
      .filter((member) => !locationFilter || member.location === locationFilter);
  }, [departmentFilter, locationFilter, searchQuery, statusFilter]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const saveRecentSearch = (keyword, count) => {
    const clean = keyword.trim();
    if (!clean) return;
    setRecentSearches((current) => [{ id: Date.now(), keyword: clean, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), count }, ...current].slice(0, 12));
  };

  const updateSearch = (value) => {
    setSearchQuery(value);
    const clean = value.trim();
    if (clean.length >= 3) {
      const count = facultyData.filter((member) => [member.name, member.department, member.cabin, member.status, member.email, ...member.subjects].join(" ").toLowerCase().includes(clean.toLowerCase())).length;
      saveRecentSearch(clean, count);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    showToast(favoriteSet.has(id) ? "Removed from favorites" : "Added to favorites");
  };

  const goSearchWith = ({ status = "", department = "" }) => {
    setStatusFilter(status);
    setDepartmentFilter(department);
    navigateSection("search");
  };

  const SectionBack = () => activeSection !== "dashboard" ? (
    <div className="mb-5 flex items-center gap-3">
      <BackButton fallbackRoute="/student-dashboard" onBack={goBackSection} />
    </div>
  ) : null;

  const renderStats = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        [UsersRound, availableCount, "Available Faculty", () => goSearchWith({ status: "Available" }), "text-cyan"],
        [Building2, departmentsCount, "Departments", () => navigateSection("departments"), "text-violetSoft"],
        [Search, recentSearches.length, "Recent Searches", () => navigateSection("recent"), "text-emerald-300"],
        [Heart, favorites.length, "Favorites", () => navigateSection("favorites"), "text-rose-300"],
      ].map(([Icon, value, label, onClick, tone]) => (
        <motion.button key={label} onClick={onClick} whileHover={{ y: -6, scale: 1.015 }} className="glass premium-border cursor-pointer rounded-3xl p-5 text-left">
          <div className="flex items-center justify-between">
            <div><div className={`text-2xl font-black ${tone}`}>{value}</div><div className="mt-1 text-sm text-slateText">{label}</div></div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]"><Icon className={`h-5 w-5 ${tone}`} /></div>
          </div>
        </motion.button>
      ))}
    </div>
  );

  const renderTable = () => (
    <Card hover={false} className="overflow-hidden">
      <div className="border-b border-white/10 p-5"><h3 className="font-bold text-white">Faculty Availability</h3></div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-muted">
            <tr className="border-b border-white/10"><th className="px-5 py-4">Faculty</th><th className="px-5 py-4">Department</th><th className="px-5 py-4">Cabin</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Timings</th><th className="px-5 py-4">Action</th></tr>
          </thead>
          <tbody>
            {filteredTable.map((member) => (
              <tr key={member.id} className="border-b border-white/[0.06] text-slateText transition hover:bg-white/[0.035]">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><img src={member.avatar} alt="" className="h-10 w-10 rounded-2xl object-cover" /><span className="font-semibold text-white">{member.name}</span></div></td>
                <td className="px-5 py-4">{member.department}</td><td className="px-5 py-4">{member.cabin}</td>
                <td className="px-5 py-4"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[member.status]}`}>{member.status}</span></td>
                <td className="px-5 py-4">{member.timings}</td>
                <td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setSelectedFaculty(member)} className="px-3 py-2">View</Button><Button onClick={() => toggleFavorite(member.id)} className="px-3 py-2">{favoriteSet.has(member.id) ? "Saved" : "Add"}</Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
        {filteredTable.map((member) => <FacultyResultCard key={member.id} member={member} isFavorite={favoriteSet.has(member.id)} onFavorite={toggleFavorite} onDetails={setSelectedFaculty} />)}
      </div>
    </Card>
  );

  const renderDashboard = () => (
    <div className="grid gap-6">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Welcome Banner</p>
        <h2 className="mt-3 text-3xl font-black text-white">Welcome back, {profile.fullName}. Your campus map is live.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slateText">Search faculty, review recent visits, pin important contacts, and track availability before heading across campus.</p>
      </Card>
      {facultyError && <Card hover={false} className="border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">Faculty data could not be loaded from the backend: {facultyError}</Card>}
      {renderStats()}
      <Card hover={false} className="p-5"><Input placeholder="Search table by name, department, cabin, subject, or status..." value={dashboardQuery} onChange={(e) => setDashboardQuery(e.target.value)} /></Card>
      {renderTable()}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <h3 className="text-xl font-bold text-white">Recent Faculty</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {facultyData.slice(0, 3).map((member) => <FacultyResultCard key={member.id} member={member} isFavorite={favoriteSet.has(member.id)} onFavorite={toggleFavorite} onDetails={setSelectedFaculty} />)}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          <div className="mt-4 grid gap-3">
            <Button onClick={() => navigateSection("search")}>Search Faculty</Button>
            <Button variant="secondary" onClick={() => navigateSection("favorites")}>View Favorites</Button>
            <Button variant="secondary" onClick={() => navigateSection("notifications")}>Notifications ({unreadCount})</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="grid gap-6">
      <div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Search Faculty</p><h2 className="mt-2 text-3xl font-black text-white">Search Faculty</h2></div>
      {facultyError && <Card hover={false} className="border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">Faculty search is connected to the backend. Current API error: {facultyError}</Card>}
      <Card hover={false} className="p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_150px_150px]">
          <Input placeholder="Search by name, department, cabin, email, subject..." value={searchQuery} onChange={(e) => updateSearch(e.target.value)} />
          <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}><option value="">Department</option>{departmentsList.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">Status</option>{statusesList.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}><option value="">Location</option>{locationsList.map((item) => <option key={item}>{item}</option>)}</Select>
        </div>
      </Card>
      {searchResults.length === 0 ? <EmptyState title="No faculty found." text="Try changing search keywords or filters." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {searchResults.map((member, index) => <motion.div key={member.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}><FacultyResultCard member={member} isFavorite={favoriteSet.has(member.id)} onFavorite={toggleFavorite} onDetails={setSelectedFaculty} /></motion.div>)}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="grid gap-5">
      <h2 className="text-3xl font-black text-white">Favorites</h2>
      {favoriteFaculty.length === 0 ? <EmptyState title="No favorites yet." text="Add faculty from search results." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{favoriteFaculty.map((member) => <FacultyResultCard key={member.id} member={member} isFavorite onFavorite={toggleFavorite} onDetails={setSelectedFaculty} />)}</div>}
    </div>
  );

  const renderRecent = () => (
    <div className="grid gap-5">
      <h2 className="text-3xl font-black text-white">Recent Searches</h2>
      {recentSearches.length === 0 ? <EmptyState title="No recent searches yet." text="Search faculty to build your recent activity." /> : recentSearches.map((item) => (
        <Card key={item.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-white">{item.keyword}</p><p className="mt-1 text-sm text-slateText">{item.count} matching faculty</p></div><span className="text-sm text-muted">{item.time}</span></div></Card>
      ))}
    </div>
  );

  const renderDepartments = () => (
    <div className="grid gap-5">
      <h2 className="text-3xl font-black text-white">Departments</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {departmentStats.map((item) => (
          <Card key={item.department} className="p-5">
            <h3 className="text-xl font-black text-white">{item.department}</h3>
            <div className="mt-4 grid gap-2 text-sm text-slateText"><span>Total faculty: {item.total}</span><span>Available: {item.available}</span><span>Busy: {item.busy}</span></div>
            <Button className="mt-5 w-full" onClick={() => goSearchWith({ department: item.department })}>View Faculty</Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => <NotificationCenter />;

  const renderProfile = () => (
    <Card className="p-6">
      <h2 className="text-3xl font-black text-white">Profile</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {Object.entries({ fullName: "Full Name", rollNo: "Roll Number", email: "Email", branch: "Branch", year: "Year", section: "Section", phone: "Phone" }).map(([key, label]) => (
          <Input key={key} placeholder={label} value={profile[key]} onChange={(e) => setProfile((current) => ({ ...current, [key]: e.target.value }))} />
        ))}
      </div>
      <Button className="mt-5" onClick={() => showToast("Profile updated successfully")}>Save Profile</Button>
    </Card>
  );

  const content = {
    dashboard: renderDashboard(),
    search: renderSearch(),
    favorites: renderFavorites(),
    recent: renderRecent(),
    departments: renderDepartments(),
    notifications: renderNotifications(),
    profile: renderProfile(),
  }[activeSection];

  return (
    <DashboardShell
      title="Student Dashboard"
      activeItem={activeLabel}
      logoutRedirect="/auth"
      onNavigate={(item) => navigateSection(navMap[item] || "dashboard")}
    >
      <Toast toast={toast} />
      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>
          <SectionBack />
          {content}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedFaculty && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 18 }} className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3"><BackButton fallbackRoute="/student-dashboard" onBack={() => setSelectedFaculty(null)} /><button onClick={() => setSelectedFaculty(null)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><X className="h-4 w-4" /></button></div>
              <h3 className="mt-5 text-xl font-bold text-white">Faculty Details</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-[140px_1fr]">
                <img src={selectedFaculty.avatar} alt={selectedFaculty.name} className="h-32 w-32 rounded-3xl object-cover" />
                <div>
                  <h2 className="text-3xl font-black text-white">{selectedFaculty.name}</h2>
                  <p className="mt-1 text-slateText">{selectedFaculty.designation} · {selectedFaculty.department}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slateText">
                    <span>Cabin: {selectedFaculty.cabin}</span><span>Status: {selectedFaculty.status}</span><span>Timings: {selectedFaculty.timings}</span><span>Email: {selectedFaculty.email}</span><span>Phone: {selectedFaculty.phone}</span><span>Subjects: {selectedFaculty.subjects.join(", ")}</span><span>Experience: {8 + (selectedFaculty.id % 18)} years</span>
                  </div>
                  <Button onClick={() => toggleFavorite(selectedFaculty.id)} className="mt-5"><Star className="h-4 w-4" />{favoriteSet.has(selectedFaculty.id) ? "Remove Favorite" : "Add Favorite"}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <CampusBot />
    </DashboardShell>
  );
}
