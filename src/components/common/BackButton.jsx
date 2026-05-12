import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

export function BackButton({ fallbackRoute = "/", label = "Back", className = "", onBack }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackRoute, { replace: true });
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      onClick={goBack}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-[#0B1120]/85 px-4 py-2 text-sm font-bold text-white shadow-[0_0_24px_rgba(6,182,212,0.22)] backdrop-blur-xl transition hover:border-violet/60 hover:bg-[#111827]/95 hover:text-cyan hover:shadow-[0_0_34px_rgba(124,58,237,0.34)]",
        "max-lg:sticky max-lg:top-4 max-lg:z-30",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </motion.button>
  );
}
