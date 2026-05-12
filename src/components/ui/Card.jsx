import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.015 } : undefined}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className={cn("glass premium-border rounded-3xl", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
