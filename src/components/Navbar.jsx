import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Logo } from "./Logo";
import { useTheme } from "../context/ThemeContext";
import { dashboardForRole, useAuth } from "../context/AuthContext";

const links = ["Home", "Features", "Search", "Dashboards", "About", "Contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = (
    <>
      {links.map((link) => (
        <a
          key={link}
          href={link === "Home" ? "/" : `/#${link.toLowerCase()}`}
          className="group relative text-sm font-medium text-slateText transition-colors duration-300 hover:text-violetSoft"
          onClick={() => setOpen(false)}
        >
          {link}
          <span className="absolute -bottom-2 left-0 h-px w-0 bg-gradient-to-r from-violetSoft to-cyan transition-all duration-300 group-hover:w-full" />
        </a>
      ))}
    </>
  );

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const accountActions = isAuthenticated ? (
    <>
      <Link to={dashboardForRole(user.role)}>
        <Button variant="secondary" className="px-5 py-2.5">
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Button>
      </Link>
      <Button variant="ghost" className="px-4 py-2.5">
        <UserRound className="h-4 w-4" /> Profile
      </Button>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet to-cyan">
          <UserRound className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <p className="max-w-28 truncate text-xs font-bold text-white">{user.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan">{user.role}</p>
        </div>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="px-4 py-2.5">
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </>
  ) : (
    <>
      <Link to="/auth"><Button variant="secondary" className="px-5 py-2.5">Login</Button></Link>
      <Link to="/auth"><Button className="px-5 py-2.5">Get Started</Button></Link>
    </>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/10 bg-night/70 shadow-glow backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0"><Logo /></Link>
        <div className="hidden items-center gap-8 lg:flex">{navItems}</div>
        <div className="hidden items-center gap-3 lg:flex">
          <button onClick={toggleTheme} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-slateText transition hover:border-violetSoft/40 hover:text-white">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {accountActions}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] lg:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mx-4 mb-4 rounded-3xl border border-white/10 bg-panel/90 p-5 backdrop-blur-xl lg:hidden"
          >
            <div className="grid gap-5">{navItems}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={toggleTheme} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white">
                {isDark ? "Dark Mode" : "Light Mode"}
              </button>
              {isAuthenticated ? (
                <>
                  <Link to={dashboardForRole(user.role)}><Button variant="secondary" className="w-full">Dashboard</Button></Link>
                  <Button variant="ghost" className="w-full">Profile</Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full">Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/auth"><Button variant="secondary" className="w-full">Login</Button></Link>
                  <Link to="/auth"><Button className="w-full">Start</Button></Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
