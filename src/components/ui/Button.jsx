import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Button({ children, className, variant = "primary", ...props }) {
  const variants = {
    primary: "violet-button text-white border-white/10",
    secondary: "bg-white/[0.04] text-white border-white/10 hover:border-cyan/35 hover:bg-white/[0.07]",
    ghost: "bg-transparent text-slateText border-white/10 hover:text-white hover:bg-white/[0.05]",
    danger: "bg-rose-500/15 text-rose-200 border-rose-400/20 hover:bg-rose-500/22",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
