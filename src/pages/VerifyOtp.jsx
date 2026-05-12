import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { BackButton } from "../components/common/BackButton";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  const otp = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const setDigit = (index, value) => {
    const next = [...digits];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setDigits(next);
    if (next[index] && index < 5) inputs.current[index + 1]?.focus();
  };

  const submit = async () => {
    setError("");
    setMessage("");
    try {
      await verifyOtp({ email, otp });
      setMessage("Email verified successfully. Please login.");
      localStorage.removeItem("campustracker:registration:draft");
      window.setTimeout(() => navigate("/auth"), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");
    try {
      await resendOtp({ email });
      setCooldown(60);
      setMessage("OTP resent successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-lg rounded-3xl p-8 text-center">
        <div className="mb-6 flex justify-start">
          <BackButton fallbackRoute="/auth" onBack={() => navigate("/auth?mode=register")} />
        </div>
        <div className="mx-auto w-fit"><Logo /></div>
        <div className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-3xl border border-cyan/25 bg-cyan/10 shadow-cyanGlow">
          <MailCheck className="h-8 w-8 text-cyan" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-white">Verify Email OTP</h1>
        <p className="mt-2 text-sm text-slateText">Enter the 6 digit OTP sent to <span className="text-cyan">{email}</span></p>
        <div className="mt-7 grid grid-cols-6 gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => { inputs.current[index] = node; }}
              value={digit}
              onChange={(e) => setDigit(index, e.target.value)}
              onKeyDown={(e) => e.key === "Backspace" && !digits[index] && inputs.current[index - 1]?.focus()}
              className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] text-center text-xl font-black text-white outline-none focus:border-cyan/50"
            />
          ))}
        </div>
        {error && <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        {message && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
        <Button onClick={submit} disabled={otp.length !== 6} className="mt-6 w-full disabled:opacity-50">Verify OTP</Button>
        <Button onClick={resend} disabled={cooldown > 0} variant="secondary" className="mt-3 w-full disabled:opacity-50">
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </Button>
      </motion.div>
    </main>
  );
}
