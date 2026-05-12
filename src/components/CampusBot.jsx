import Fuse from "fuse.js";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { departmentsList, faculty } from "../data/faculty";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function intentFor(query) {
  if (/(where is|find|location|cabin|room)/.test(query)) return "location";
  if (/(available|free|busy|in class|on leave)/.test(query)) return "availability";
  if (/(book|appointment|meeting|request)/.test(query)) return "appointment";
  if (/(help|what can you do)/.test(query)) return "help";
  if (departmentsList.some((dept) => query.includes(dept.toLowerCase()))) return "department";
  return "faculty";
}

function formatFaculty(member, intent) {
  if (intent === "appointment") {
    return `You can book an appointment with ${member.name}. Click "Book Appointment" on the faculty card or open the appointment modal.`;
  }
  if (intent === "availability") {
    return `${member.name} is currently ${member.status} in ${member.cabin}. Available time: ${member.timings}.`;
  }
  return `${member.name} is in the ${member.department} department. Current cabin/location: ${member.cabin}. Status: ${member.status}. Available time: ${member.timings}.`;
}

function makeReply(raw, fuse) {
  const query = normalize(raw);
  const intent = intentFor(query);
  if (intent === "help") {
    return "I can help you find faculty, check availability, book appointments, explain departments, guide you around the campus map, and show event information.";
  }

  const department = departmentsList.find((dept) => query.includes(dept.toLowerCase()));
  if (department && (intent === "department" || query.includes("show"))) {
    const matches = faculty.filter((member) => member.department === department).slice(0, 6);
    return `I found ${matches.length} ${department} faculty members:\n${matches.slice(0, 3).map((member, index) => `${index + 1}. ${member.name} - ${member.status} - ${member.cabin}`).join("\n")}`;
  }

  const exact = faculty.find((member) => query.includes(member.name.replace(/^Dr\.\s*/i, "").toLowerCase()));
  const partial = exact || faculty.find((member) => member.name.toLowerCase().split(/\s+/).some((part) => part.length > 3 && query.includes(part)));
  const fuzzy = partial || fuse.search(query)[0]?.item;
  if (fuzzy) return formatFaculty(fuzzy, intent);

  const matches = fuse.search(query).map((item) => item.item).slice(0, 3);
  if (matches.length > 1) {
    return `I found ${matches.length} possible matches:\n${matches.map((member, index) => `${index + 1}. ${member.name} - ${member.status} - ${member.cabin}`).join("\n")}`;
  }

  return "I couldn't find that faculty. Try searching by full name, department, subject, or cabin.";
}

export function CampusBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: "Hi, I am CampusBot. Ask where a faculty is, if they are available, or how to book an appointment." }]);
  const scrollRef = useRef(null);
  const fuse = useMemo(() => new Fuse(faculty, { threshold: 0.38, keys: ["name", "department", "subjects", "cabin", "designation", "status", "location", "email"] }), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [...current, { from: "user", text }, { from: "bot", text: makeReply(text, fuse) }]);
    setInput("");
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-3xl border border-cyan/30 bg-cyan/15 text-cyan shadow-cyanGlow backdrop-blur-xl"><Bot /></button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.95 }} className="glass fixed bottom-24 right-5 z-50 w-[min(400px,calc(100vw-2rem))] rounded-3xl p-4">
            <div className="flex items-center justify-between"><h3 className="font-black text-white">CampusBot</h3><button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button></div>
            <div ref={scrollRef} className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-line rounded-2xl p-3 text-sm ${message.from === "bot" ? "bg-cyan/10 text-slateText" : "bg-violet/25 text-white"}`}>{message.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask CampusBot..." onKeyDown={(e) => e.key === "Enter" && send()} />
              <Button onClick={send} className="px-4"><Send className="h-4 w-4" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
