import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Globe2, GraduationCap, KeyRound, Loader2, Mail, School, UserRound, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { dashboardForRole, useAuth } from "../context/AuthContext";

const roles = ["Student", "Teacher", "Admin"];
const REGISTER_DRAFT_KEY = "campustracker:registration:draft";

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(() => params.get("mode") === "register" ? "register" : "login");
  const [role, setRole] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(REGISTER_DRAFT_KEY) || "{}");
      return draft.role || "Student";
    } catch {
      return "Student";
    }
  });
  const [form, setForm] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(REGISTER_DRAFT_KEY) || "{}").form || {};
    } catch {
      return {};
    }
  });
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login, register, isAuthenticated, role: authRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(dashboardForRole(authRole), { replace: true });
  }, [authRole, isAuthenticated, navigate]);

  useEffect(() => {
    if (mode === "register") {
      localStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify({ role, form }));
    }
  }, [form, mode, role]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectedRole = role.toLowerCase();

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2400);
  };

  const submit = (event) => {
    event.preventDefault();
    const required = mode === "login" ? ["email", "password"] : ["name", "email", "password", "confirm"];
    const roleRequired = mode === "register" ? selectedRole === "student" ? ["rollNumber", "branch", "year", "section", "phone"] : selectedRole === "teacher" ? ["employeeId", "department", "cabin", "designation", "phone"] : ["adminId", "adminSecretCode", "phone"] : [];
    const missing = [...required, ...roleRequired].some((field) => !form[field]);
    if (missing) return showToast("error", "Please complete all required fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "")) return showToast("error", "Enter a valid email address.");
    if (mode === "register" && !/^\d{10}$/.test(form.phone || "")) return showToast("error", "Phone number must be 10 digits.");
    if ((form.password || "").length < 6) return showToast("error", "Password must be at least 6 characters.");
    if (mode === "register" && form.password !== form.confirm) return showToast("error", "Passwords must match.");

    setLoading(true);
    window.setTimeout(() => {
      (async () => {
        try {
          const result = mode === "login"
            ? await login({ email: form.email, password: form.password, role: selectedRole })
            : await register({ ...form, role: selectedRole });
          showToast("success", mode === "login" ? "Login successful" : "OTP sent to your email");
          window.setTimeout(() => {
            if (mode === "login") navigate(result.redirectTo, { replace: true });
            else navigate(`/verify-otp?email=${encodeURIComponent(result.email)}`);
          }, 450);
        } catch (error) {
          showToast("error", error.message);
        } finally {
          setLoading(false);
        }
      })();
    }, 650);
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold backdrop-blur-xl ${
              toast.type === "success" ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-200" : "border-rose-400/25 bg-rose-500/15 text-rose-200"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass grid w-full max-w-6xl overflow-hidden rounded-3xl lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submit} className="p-6 sm:p-10">
          <Logo />
          <div className="mt-10">
            <h1 className="text-3xl font-black text-white">{mode === "login" ? "Welcome Back" : "Create Your Account"}</h1>
            <p className="mt-2 text-sm text-slateText">Access your CampusTracker dashboard.</p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-1">
            {roles.map((item) => (
              <button type="button" key={item} onClick={() => setRole(item)} className="relative rounded-xl px-3 py-2 text-sm font-semibold text-slateText">
                {role === item && <motion.span layoutId="role-pill" className="absolute inset-0 rounded-xl bg-violet/35" />}
                <span className="relative text-white">{item}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMode("login")} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${mode === "login" ? "border-cyan/35 bg-cyan/10 text-white" : "border-white/10 text-slateText"}`}>Login</button>
            <button type="button" onClick={() => setMode("register")} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${mode === "register" ? "border-cyan/35 bg-cyan/10 text-white" : "border-white/10 text-slateText"}`}>Register</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode + role} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="mt-6 grid gap-4">
              {mode === "register" && <Input placeholder="Full Name" value={form.name || ""} onChange={(e) => set("name", e.target.value)} />}
              <Input placeholder="Email" type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
              {mode === "register" && <Input placeholder="Phone Number" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />}
              <Input placeholder="Password" type="password" value={form.password || ""} onChange={(e) => set("password", e.target.value)} />
              {mode === "register" && <Input placeholder="Confirm Password" type="password" value={form.confirm || ""} onChange={(e) => set("confirm", e.target.value)} />}
              {mode === "register" && selectedRole === "student" && <>
                <Input placeholder="Roll Number" value={form.rollNumber || ""} onChange={(e) => set("rollNumber", e.target.value)} />
                <div className="grid grid-cols-2 gap-4"><Input placeholder="Branch" value={form.branch || ""} onChange={(e) => set("branch", e.target.value)} /><Input placeholder="Year" value={form.year || ""} onChange={(e) => set("year", e.target.value)} /></div>
                <Input placeholder="Section" value={form.section || ""} onChange={(e) => set("section", e.target.value)} />
              </>}
              {mode === "register" && selectedRole === "teacher" && <>
                <Input placeholder="Employee ID" value={form.employeeId || ""} onChange={(e) => set("employeeId", e.target.value)} />
                <div className="grid grid-cols-2 gap-4"><Input placeholder="Department" value={form.department || ""} onChange={(e) => set("department", e.target.value)} /><Input placeholder="Cabin" value={form.cabin || ""} onChange={(e) => set("cabin", e.target.value)} /></div>
                <Input placeholder="Designation" value={form.designation || ""} onChange={(e) => set("designation", e.target.value)} />
              </>}
              {mode === "register" && selectedRole === "admin" && <>
                <Input placeholder="Admin ID" value={form.adminId || ""} onChange={(e) => set("adminId", e.target.value)} />
                <Input placeholder="Admin Secret Code" value={form.adminSecretCode || ""} onChange={(e) => set("adminSecretCode", e.target.value)} />
              </>}
            </motion.div>
          </AnimatePresence>

          {mode === "login" && (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slateText">
                <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-white/10 accent-violet" />
                Remember me
              </label>
              <span className="text-cyan">Forgot password?</span>
            </div>
          )}

          <Button disabled={loading} className="mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Login" : "Create Account"}
          </Button>
          <Button type="button" variant="secondary" className="mt-3 w-full"><Globe2 className="h-4 w-4" />Continue with Google</Button>

          <p className="mt-6 text-center text-xs text-slateText">Register with your real campus details, verify your email OTP, then login.</p>
        </form>

        <div className="relative min-h-[620px] overflow-hidden bg-gradient-to-br from-violet/35 via-panel to-cyan/20 p-8">
          <div className="absolute inset-0 bg-grid-glow bg-[length:48px_48px] opacity-40" />
          <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-10 left-8 right-8 rounded-3xl border border-white/10 bg-night/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3"><School className="h-7 w-7 text-cyan" /><h2 className="text-2xl font-black text-white">Smart campus at night</h2></div>
            <p className="mt-3 text-sm leading-6 text-slateText">Track faculty availability in real time.</p>
          </motion.div>
          <div className="relative z-10 mx-auto mt-12 grid max-w-md gap-4">
            {[["Student", GraduationCap], ["Faculty", UserRound], ["Secure Access", KeyRound], ["Campus Mail", Mail]].map(([text, Icon], i) => (
              <motion.div key={text} animate={{ x: [0, i % 2 ? -10 : 10, 0] }} transition={{ duration: 6 + i, repeat: Infinity }} className="glass flex items-center gap-4 rounded-3xl p-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan/10"><Icon className="h-5 w-5 text-cyan" /></div>
                <span className="font-semibold text-white">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
