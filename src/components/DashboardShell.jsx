import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarClock, Heart, LayoutDashboard, LogOut, Menu, Search, Settings, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

const iconMap = { Dashboard: LayoutDashboard, "Search Faculty": Search, Favorites: Heart, Notifications: Bell, Profile: UserRound, Settings, Logout: LogOut, "My Favorites": Heart, "My Bookings": CalendarClock };

export function DashboardShell({ children, title, nav = ["Dashboard", "Search Faculty", "Favorites", "Notifications", "Profile", "Logout"], activeItem = "Dashboard", onNavigate, logoutRedirect = "/" }) {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleNav = (item) => {
    if (item === "Logout") {
      logout();
      navigate(logoutRedirect);
      return;
    }
    onNavigate?.(item);
  };
  const Sidebar = (
    <aside className="h-screen w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-panel/72 p-5 backdrop-blur-xl">
      <Link to="/" className="mb-8 block"><Logo /></Link>
      <nav className="grid gap-2">
        {nav.map((item, index) => {
          const Icon = iconMap[item] || LayoutDashboard;
          const isActive = activeItem === item;
          return (
            <button onClick={() => handleNav(item)} key={item} className={`premium-border flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${isActive ? "border-cyan/30 bg-violet/18 text-white shadow-glow" : "border-transparent text-slateText hover:border-white/10 hover:bg-white/[0.05] hover:text-white"}`}>
              <Icon className={`h-4 w-4 ${isActive ? "text-cyan" : ""}`} />
              {item}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <main className="h-screen overflow-hidden bg-night pt-0 text-white">
      <div className="flex h-screen overflow-hidden">
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{Sidebar}</div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/55 lg:hidden">
              <motion.div initial={{ x: -290 }} animate={{ x: 0 }} exit={{ x: -290 }} className="h-full">
                {Sidebar}
              </motion.div>
              <button onClick={() => setOpen(false)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-panel"><X /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <section className="min-w-0 flex-1 overflow-y-auto">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-night/70 px-4 py-4 backdrop-blur-xl sm:px-6">
            <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] lg:hidden"><Menu /></button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">CampusTracker</p>
              <h1 className="text-xl font-black sm:text-2xl">{title}</h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slateText">{user?.role} access</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slateText"><Bell className="h-4 w-4" /></button>
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet to-cyan" />
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
