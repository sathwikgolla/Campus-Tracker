import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input, Select } from "./ui/Input";
import { QueueStatus } from "./QueueStatus";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "./common/BackButton";
import { createFacultyRequest } from "../services/requestService";

export function AppointmentBookingModal({ faculty, open, onClose }) {
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({ slot: "10:30 AM - 11:00 AM", reason: "", message: "" });
  const [error, setError] = useState("");
  const { token } = useAuth();
  if (!faculty) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="glass w-full max-w-xl rounded-3xl p-6" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
            <div className="flex items-center justify-between">
              <BackButton fallbackRoute="/student-dashboard" onBack={onClose} />
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><X className="h-4 w-4" /></button>
            </div>
            <h3 className="mt-5 text-xl font-black text-white">Book Appointment</h3>
            <p className="mt-2 text-sm text-slateText">{faculty.name} · {faculty.cabin}</p>
            <div className="mt-5 grid gap-4">
              <Select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
                <option>10:30 AM - 11:00 AM</option>
                <option>12:00 PM - 12:30 PM</option>
                <option>2:00 PM - 3:00 PM</option>
              </Select>
              <Input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <Input placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {error && <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
              {created && <QueueStatus tokenNumber={created.tokenNumber} status={created.status} />}
              <Button onClick={async () => {
                setError("");
                try {
                  const request = await createFacultyRequest({
                    teacherId: faculty.user,
                    facultyProfileId: faculty._id || faculty.id,
                    reason: form.reason || "Appointment request",
                    message: form.message,
                    requestedTime: form.slot,
                  }, token);
                  setCreated({ tokenNumber: request.tokenNumber || "Pending", status: request.status || "Pending" });
                } catch (err) {
                  setError(err.message || "Appointment request failed");
                }
              }}>Send Request</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
