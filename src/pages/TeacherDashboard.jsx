import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarClock, CheckCircle2, Clock, Lock, MapPin, MessageSquare, Plus, Save, Trash2, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";
import { MetricCard } from "../components/DashboardWidgets";
import { NotificationCenter } from "../components/NotificationCenter";
import { BackButton } from "../components/common/BackButton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { acceptTeacherRequest, rejectTeacherRequest } from "../services/requestService";
import { createTeacherSlot, deleteTeacherSlot, fetchTeacherDashboard, updateTeacherStatus } from "../services/teacherService";

const navMap = {
  Dashboard: "dashboard",
  "Update Availability": "availability",
  "Student Requests": "requests",
  "Open Slots": "slots",
  Notifications: "notifications",
  Profile: "profile",
  Settings: "settings",
};

const initialRequests = [];
const initialSlots = [];

const statusChip = {
  Pending: "border-amber-400/25 bg-amber-500/12 text-amber-200",
  Accepted: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200",
  Rejected: "border-rose-400/25 bg-rose-500/12 text-rose-200",
  Available: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200",
  Booked: "border-cyan/25 bg-cyan/12 text-cyan",
};

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

function RequestPanel({ requests, onDecision }) {
  return (
    <Card hover={false} className="p-5">
      <h3 className="text-xl font-bold text-white">Student Requests</h3>
      {requests.length === 0 && <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slateText">No student requests yet.</p>}
      <div className="mt-5 grid gap-3">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 lg:grid-cols-[1fr_1.1fr_auto]"
          >
            <div>
              <p className="font-bold text-white">{request.studentName}</p>
              <p className="mt-1 text-sm text-slateText">{request.rollNo} · {request.department}</p>
            </div>
            <div>
              <p className="text-sm text-white">{request.reason}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slateText"><Clock className="h-4 w-4 text-cyan" />{request.requestedTime}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusChip[request.status]}`}>{request.status}</span>
              <Button disabled={request.status !== "Pending"} onClick={() => onDecision(request.id, "Accepted")} className="bg-gradient-to-r from-emerald-500 to-cyan px-4 py-2 disabled:opacity-45">Accept</Button>
              <Button disabled={request.status !== "Pending"} onClick={() => onDecision(request.id, "Rejected")} className="bg-gradient-to-r from-rose-600 to-rose-900 px-4 py-2 disabled:opacity-45">Reject</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function SlotsPanel({ slots, onAdd, onDelete }) {
  return (
    <Card hover={false} className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-white">Open Slots</h3>
        <Button onClick={onAdd} className="px-4 py-2"><Plus className="h-4 w-4" />Add New Slot</Button>
      </div>
      <div className="mt-5 grid gap-3">
        {slots.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slateText">No open slots yet.</p>}
        {slots.map((slot) => (
          <motion.div key={slot.id} whileHover={{ y: -4 }} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <p className="font-bold text-white">{slot.time}</p>
              <p className="mt-1 text-sm text-slateText">{slot.type}</p>
            </div>
            <span className={`w-fit self-center rounded-full border px-3 py-1 text-xs font-semibold ${statusChip[slot.status]}`}>{slot.status}</span>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-4 py-2">Edit</Button>
              <Button variant="danger" onClick={() => onDelete(slot.id)} className="px-4 py-2"><Trash2 className="h-4 w-4" />Delete</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sectionHistory, setSectionHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Available");
  const [requests, setRequests] = useState(initialRequests);
  const [openSlots, setOpenSlots] = useState(initialSlots);
  const [toast, setToast] = useState("");
  const [focusedPanel, setFocusedPanel] = useState("");
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ start: "", end: "", type: "", status: "Available" });
  const [cabinInfo, setCabinInfo] = useState({ cabin: "B-204", timings: "10:30 AM - 2:00 PM" });
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", department: user?.department || "", designation: "", cabin: "", phone: "", subjects: "" });
  const [dashboardError, setDashboardError] = useState("");
  const cabinRef = useRef(null);
  const { toggleTheme, theme } = useTheme();
  const { notifications } = useNotifications();

  useEffect(() => {
    let alive = true;
    async function loadTeacherData() {
      try {
        const data = await fetchTeacherDashboard(token);
        if (!alive) return;
        setCurrentStatus(data.currentStatus || "Not Updated");
        setCabinInfo({ cabin: data.currentCabin || "Cabin not assigned", timings: data.availableTime || "No timetable available" });
        setRequests((data.requests || []).map((request) => ({
          id: request._id || request.id,
          studentName: request.student?.name || "Student",
          rollNo: request.student?.rollNumber || "Roll number unavailable",
          department: request.student?.branch || "Department unavailable",
          reason: request.reason,
          requestedTime: request.requestedTime,
          status: request.status,
        })));
        setOpenSlots((data.slots || []).map((slot) => ({
          id: slot._id || slot.id,
          time: `${slot.startTime || ""} - ${slot.endTime || ""}`.trim(),
          type: slot.type,
          status: slot.status,
        })));
        setProfile({
          name: data.teacher?.name || user?.name || "",
          email: data.teacher?.email || user?.email || "",
          department: data.teacher?.department || "",
          designation: data.teacher?.designation || "",
          cabin: data.currentCabin || "",
          phone: data.teacher?.phone || "",
          subjects: Array.isArray(data.teacher?.subjects) ? data.teacher.subjects.join(", ") : "",
        });
        setDashboardError("");
      } catch (error) {
        if (!alive) return;
        setDashboardError(error.message || "Unable to load teacher dashboard from backend");
      }
    }
    if (token) loadTeacherData();
    return () => { alive = false; };
  }, [token, user?.email, user?.name]);

  const pendingCount = useMemo(() => requests.filter((request) => request.status === "Pending").length, [requests]);
  const availableSlotsCount = useMemo(() => openSlots.filter((slot) => slot.status === "Available").length, [openSlots]);
  const unreadCount = useMemo(() => notifications.filter((item) => (item.role === "teacher" || item.userId === user?.id) && !item.isRead).length, [notifications, user?.id]);
  const activeLabel = Object.entries(navMap).find(([, value]) => value === activeSection)?.[0] || "Dashboard";

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

  const SectionBack = () => activeSection !== "dashboard" ? (
    <div className="mb-5 flex items-center gap-3">
      <BackButton fallbackRoute="/teacher-dashboard" onBack={goBackSection} />
    </div>
  ) : null;

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleDecision = (id, status) => {
    (async () => {
      try {
        const updated = status === "Accepted" ? await acceptTeacherRequest(id, token) : await rejectTeacherRequest(id, token);
        setRequests((current) => current.map((request) => request.id === id ? { ...request, status: updated.status || status } : request));
        showToast(status === "Accepted" ? "Request accepted" : "Request rejected");
      } catch (error) {
        showToast(error.message || "Request update failed");
      }
    })();
  };

  const saveSlot = () => {
    if (!newSlot.start || !newSlot.end || !newSlot.type) return showToast("Complete slot details first");
    (async () => {
      try {
        const saved = await createTeacherSlot({ date: new Date().toISOString().slice(0, 10), startTime: newSlot.start, endTime: newSlot.end, type: newSlot.type, status: newSlot.status }, token);
        setOpenSlots((current) => [...current, { id: saved._id || Date.now(), time: `${saved.startTime || newSlot.start} - ${saved.endTime || newSlot.end}`, type: saved.type || newSlot.type, status: saved.status || newSlot.status }]);
        setNewSlot({ start: "", end: "", type: "", status: "Available" });
        setSlotModalOpen(false);
        showToast("Slot added successfully");
      } catch (error) {
        showToast(error.message || "Slot could not be saved");
      }
    })();
  };

  const saveAvailability = () => {
    (async () => {
      try {
        await updateTeacherStatus({ status: currentStatus, cabin: cabinInfo.cabin, location: cabinInfo.cabin, availableTime: cabinInfo.timings }, token);
        showToast("Availability saved successfully");
      } catch (error) {
        showToast(error.message || "Availability update failed");
      }
    })();
  };

  const metricClick = (panel) => {
    if (panel === "requests") setFocusedPanel("requests");
    if (panel === "slots") setFocusedPanel("slots");
    if (panel === "cabin") {
      setFocusedPanel("cabin");
      window.setTimeout(() => cabinRef.current?.focus(), 80);
    }
    if (panel === "messages") navigateSection("notifications");
  };

  const renderDashboard = () => (
    <div className="grid gap-6">
      {dashboardError && <Card hover={false} className="border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">Teacher dashboard could not be loaded from the backend: {dashboardError}</Card>}
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Availability Control</p>
        <h2 className="mt-3 text-3xl font-black text-white">Current status: <span className="aurora-text">{currentStatus}</span></h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {["Available", "Busy", "In Class", "On Leave"].map((item) => (
            <Button key={item} variant={item === currentStatus ? "primary" : "secondary"} onClick={() => {
              setCurrentStatus(item);
              updateTeacherStatus({ status: item, cabin: cabinInfo.cabin, location: cabinInfo.cabin, availableTime: cabinInfo.timings }, token)
                .then(() => showToast("Status Updated Successfully"))
                .catch((error) => showToast(error.message || "Status update failed"));
            }}>{item}</Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button onClick={() => metricClick("requests")} className="text-left"><MetricCard icon={UsersRound} value={pendingCount} label="Student Requests" /></button>
        <button onClick={() => metricClick("slots")} className="text-left"><MetricCard icon={CalendarClock} value={availableSlotsCount} label="Open Slots" tone="text-violetSoft" /></button>
        <button onClick={() => metricClick("cabin")} className="text-left"><MetricCard icon={MapPin} value={cabinInfo.cabin} label="Current Cabin" tone="text-cyan" /></button>
        <button onClick={() => metricClick("messages")} className="text-left"><MetricCard icon={MessageSquare} value={unreadCount} label="Unread Messages" tone="text-amber-300" /></button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className={`p-6 ${focusedPanel === "cabin" ? "ring-2 ring-cyan/40" : ""}`}>
          <h3 className="text-xl font-bold text-white">Update Cabin</h3>
          <div className="mt-5 grid gap-4">
            <Input ref={cabinRef} placeholder="Cabin, e.g. Block B-204" value={cabinInfo.cabin} onChange={(e) => setCabinInfo((current) => ({ ...current, cabin: e.target.value }))} />
            <Input placeholder="Available timings, e.g. 10:30 AM - 2:00 PM" value={cabinInfo.timings} onChange={(e) => setCabinInfo((current) => ({ ...current, timings: e.target.value }))} />
            <p className="text-sm text-slateText">Available Timings: <span className="text-cyan">{cabinInfo.timings}</span></p>
            <Button onClick={saveAvailability}><Save className="h-4 w-4" />Save Availability</Button>
          </div>
        </Card>
        <RequestPanel requests={requests} onDecision={handleDecision} />
      </div>

      {focusedPanel === "requests" && <RequestPanel requests={requests} onDecision={handleDecision} />}
      {focusedPanel === "slots" && <SlotsPanel slots={openSlots} onAdd={() => setSlotModalOpen(true)} onDelete={(id) => {
        deleteTeacherSlot(id, token)
          .then(() => setOpenSlots((current) => current.filter((slot) => slot.id !== id)))
          .catch((error) => showToast(error.message || "Slot delete failed"));
      }} />}
    </div>
  );

  const renderNotifications = () => <NotificationCenter />;

  const renderProfile = () => (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white">Teacher Profile</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {Object.entries({ name: "Full Name", email: "Email", department: "Department", designation: "Designation", cabin: "Cabin", phone: "Phone", subjects: "Subjects" }).map(([key, label]) => (
          <Input key={key} placeholder={label} value={profile[key]} onChange={(e) => setProfile((current) => ({ ...current, [key]: e.target.value }))} className={key === "subjects" ? "md:col-span-2" : ""} />
        ))}
      </div>
      <Button onClick={() => showToast("Profile updated")} className="mt-5">Save Profile</Button>
    </Card>
  );

  const renderSettings = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white">Settings</h3>
        <div className="mt-5 grid gap-4">
          <button onClick={toggleTheme} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left">
            <span><span className="block font-semibold text-white">Theme</span><span className="text-sm text-slateText">Current: {theme}</span></span>
            <span className="rounded-full bg-violet/20 px-3 py-1 text-sm text-cyan">Toggle</span>
          </button>
          {["Notification preferences", "Availability auto-reset", "Privacy mode"].map((label) => (
            <label key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white">
              {label}<input type="checkbox" defaultChecked className="h-5 w-5 accent-violet" />
            </label>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white">Change Password</h3>
        <div className="mt-5 grid gap-4">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm new password" />
          <Button onClick={() => showToast("Password settings saved")}><Lock className="h-4 w-4" />Save Password</Button>
        </div>
      </Card>
    </div>
  );

  const content = {
    dashboard: renderDashboard(),
    availability: renderDashboard(),
    requests: <RequestPanel requests={requests} onDecision={handleDecision} />,
    slots: <SlotsPanel slots={openSlots} onAdd={() => setSlotModalOpen(true)} onDelete={(id) => {
      deleteTeacherSlot(id, token)
        .then(() => setOpenSlots((current) => current.filter((slot) => slot.id !== id)))
        .catch((error) => showToast(error.message || "Slot delete failed"));
    }} />,
    notifications: renderNotifications(),
    profile: renderProfile(),
    settings: renderSettings(),
  }[activeSection];

  return (
    <DashboardShell
      title="Teacher Dashboard"
      nav={["Dashboard", "Update Availability", "Student Requests", "Open Slots", "Notifications", "Profile", "Settings", "Logout"]}
      activeItem={activeLabel}
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
        {slotModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 18 }} className="glass w-full max-w-lg rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <BackButton fallbackRoute="/teacher-dashboard" onBack={() => setSlotModalOpen(false)} />
                <button onClick={() => setSlotModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><X className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Add New Slot</h3>
              <div className="mt-5 grid gap-4">
                <Input placeholder="Start time, e.g. 3:00 PM" value={newSlot.start} onChange={(e) => setNewSlot((current) => ({ ...current, start: e.target.value }))} />
                <Input placeholder="End time, e.g. 3:30 PM" value={newSlot.end} onChange={(e) => setNewSlot((current) => ({ ...current, end: e.target.value }))} />
                <Input placeholder="Slot type" value={newSlot.type} onChange={(e) => setNewSlot((current) => ({ ...current, type: e.target.value }))} />
                <Select value={newSlot.status} onChange={(e) => setNewSlot((current) => ({ ...current, status: e.target.value }))}>
                  <option>Available</option>
                  <option>Booked</option>
                </Select>
                <Button onClick={saveSlot}>Save Slot</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
