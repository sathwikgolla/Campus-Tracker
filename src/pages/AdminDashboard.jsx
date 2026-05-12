import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, FileText, GraduationCap, UsersRound } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { DashboardShell } from "../components/DashboardShell";
import { FacultyTable, MetricCard } from "../components/DashboardWidgets";
import { BackButton } from "../components/common/BackButton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { departmentsList, faculty, timetable } from "../data/faculty";
import { useAuth } from "../context/AuthContext";
import { fetchAdminDashboard } from "../services/dashboardService";

const navMap = {
  Dashboard: "dashboard",
  "Manage Users": "users",
  "Manage Faculty": "faculty",
  Departments: "departments",
  Broadcasts: "broadcasts",
  Analytics: "analytics",
  Reports: "reports",
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sectionHistory, setSectionHistory] = useState([]);
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const availableFaculty = dashboardData?.availableFaculty ?? faculty.filter((item) => item.status === "Available").length;
  const inClassFaculty = dashboardData?.inClassFaculty ?? faculty.filter((item) => item.status === "In Class").length;
  const totalFaculty = dashboardData?.totalFaculty ?? faculty.length;
  const totalDepartments = dashboardData?.totalDepartments ?? departmentsList.length;
  const timetableEntries = dashboardData?.timetableEntries ?? timetable.length;
  const departmentWise = dashboardData?.departmentWiseFaculty
    ? Object.entries(dashboardData.departmentWiseFaculty).map(([dept, count]) => ({ dept, count }))
    : departmentsList.map((dept) => ({ dept, count: faculty.filter((item) => item.department === dept).length }));
  const activeLabel = Object.entries(navMap).find(([, section]) => section === activeSection)?.[0] || "Dashboard";

  useEffect(() => {
    let alive = true;
    async function loadAdminDashboard() {
      try {
        const response = await fetchAdminDashboard(token);
        if (!alive) return;
        setDashboardData(response.data || response);
        setDashboardError("");
      } catch (error) {
        if (!alive) return;
        setDashboardError(error.message || "Unable to load admin dashboard from backend");
      }
    }
    if (token) loadAdminDashboard();
    return () => { alive = false; };
  }, [token]);

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

  const renderDashboard = () => (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} value={totalFaculty} label="Real Teachers" />
        <MetricCard icon={GraduationCap} value={totalDepartments} label="Departments" tone="text-violetSoft" />
        <MetricCard icon={BarChart3} value={availableFaculty} label="Available Faculty" tone="text-cyan" />
        <MetricCard icon={FileText} value={timetableEntries} label="Timetable Entries" tone="text-emerald-300" />
      </div>
      {dashboardError && <Card hover={false} className="border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">Admin analytics could not be loaded from the backend: {dashboardError}</Card>}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <FacultyTable limit={10} />
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white">Department Analytics</h3>
          <div className="mt-6 grid gap-4">
            {departmentWise.map(({ dept, count }) => (
              <div key={dept}>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slateText">{dept}</span><span className="text-white">{count} faculty</span></div>
                <div className="h-3 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: `${Math.max(8, (count / faculty.length) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <Button className="mt-7 w-full">Faculty In Class: {inClassFaculty}</Button>
        </Card>
      </div>
      <Card hover={false} className="overflow-hidden">
        <div className="border-b border-white/10 p-5"><h3 className="font-bold text-white">Uploaded JSON Data</h3></div>
        <div className="grid gap-3 p-5">
          {faculty.slice(0, 5).map((teacher) => (
            <div key={teacher.email} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slateText">
              <span>{teacher.name} - {teacher.department} - {teacher.cabin}</span>
              <Button variant="secondary" onClick={() => navigateSection("faculty")} className="px-4 py-2">Manage</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderManagement = (title, subtitle, rows) => (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Admin Management</p>
        <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm text-slateText">{subtitle}</p>
      </div>
      <Card hover={false} className="overflow-hidden">
        <div className="grid gap-3 p-5">
          {rows.map((row) => (
            <div key={row.id || row.email || row.name} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slateText">
              <span>{row.label}</span>
              <Button variant="secondary" className="px-4 py-2">Open</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const content = {
    dashboard: renderDashboard(),
    users: renderManagement("Manage Users", "Review registered users and role assignments.", faculty.slice(0, 8).map((item) => ({ ...item, label: `${item.name} - teacher - ${item.email}` }))),
    faculty: renderManagement("Manage Faculty", "Edit faculty records imported from campus JSON data.", faculty.slice(0, 12).map((item) => ({ ...item, label: `${item.name} - ${item.department} - ${item.cabin}` }))),
    departments: renderManagement("Departments", "Department-wise faculty distribution.", departmentWise.map((item) => ({ id: item.dept, label: `${item.dept} - ${item.count} faculty` }))),
    broadcasts: renderManagement("Broadcasts", "Create and review emergency campus broadcasts.", [{ id: "new", label: "New broadcast composer" }, { id: "history", label: "Broadcast history" }]),
    analytics: renderDashboard(),
    reports: renderManagement("Reports", "Operational snapshots for faculty and timetable data.", [{ id: "faculty", label: `Faculty report - ${faculty.length} records` }, { id: "timetable", label: `Timetable report - ${timetable.length} entries` }]),
  }[activeSection];

  return (
    <DashboardShell
      title="Admin Dashboard"
      nav={["Dashboard", "Manage Users", "Manage Faculty", "Departments", "Broadcasts", "Analytics", "Reports", "Logout"]}
      activeItem={activeLabel}
      onNavigate={(item) => navigateSection(navMap[item] || "dashboard")}
    >
      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>
          {activeSection !== "dashboard" && <div className="mb-5"><BackButton fallbackRoute="/admin-dashboard" onBack={goBackSection} /></div>}
          {content}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  );
}
