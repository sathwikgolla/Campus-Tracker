import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export function EmergencyBanner() {
  const [broadcast, setBroadcast] = useState(null);
  useEffect(() => {
    window.campusBroadcast = (payload) => setBroadcast(payload);
    return () => { delete window.campusBroadcast; };
  }, []);
  return (
    <AnimatePresence>
      {broadcast && (
        <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} className="fixed inset-x-0 top-0 z-[70] border-b border-rose-400/30 bg-rose-950/90 px-4 py-3 text-white backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3"><AlertTriangle className="text-rose-300" /><span className="font-bold">{broadcast.title}</span><span className="text-sm text-rose-100">{broadcast.message}</span></div>
            <button onClick={() => setBroadcast(null)}><X className="h-4 w-4" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
