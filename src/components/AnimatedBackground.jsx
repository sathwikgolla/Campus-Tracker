import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function AnimatedBackground() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 28 });
  const sy = useSpring(y, { stiffness: 80, damping: 28 });

  useEffect(() => {
    const onMove = (event) => {
      x.set(event.clientX - 190);
      y.set(event.clientY - 190);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden noisy">
      <div className="absolute inset-0 bg-grid-glow grid-texture opacity-60" />
      <motion.div
        className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-cyan/20 blur-3xl"
        animate={{ x: [0, -70, 20, 0], y: [0, 55, -20, 0], scale: [1, 1.14, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-24 h-96 w-96 rounded-full bg-violet/25 blur-3xl"
        animate={{ x: [0, 55, -35, 0], y: [0, -40, 25, 0], scale: [1, 0.92, 1.12, 1] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute h-96 w-96 rounded-full bg-violetSoft/10 blur-3xl"
      />
    </div>
  );
}
