import { cn } from "../../lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-muted focus:border-cyan/50 focus:bg-white/[0.06] focus:shadow-cyanGlow",
        className
      )}
      {...props}
    />
  );
});

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "select-dark rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition-all focus:border-violetSoft/50 focus:shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
