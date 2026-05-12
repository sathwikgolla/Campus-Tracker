import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const events = [
  ["AI Workshop", "Workshop", "CSE", "Auditorium", "May 18"],
  ["Cloud Seminar", "Seminar", "IT", "Block A", "May 20"],
  ["Campus Hackathon", "Hackathon", "AIML", "Lab 4", "May 24"],
];

export function EventsPage() {
  const [saved, setSaved] = useState([]);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {events.map(([title, category, department, venue, date]) => (
        <Card key={title} className="p-5">
          <p className="text-sm text-cyan">{category} · {department}</p>
          <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
          <p className="mt-3 text-sm text-slateText">{date} at {venue}</p>
          <Button className="mt-5 w-full" onClick={() => setSaved((s) => s.includes(title) ? s.filter((x) => x !== title) : [...s, title])}>{saved.includes(title) ? "Interested" : "Mark Interested"}</Button>
        </Card>
      ))}
    </div>
  );
}
