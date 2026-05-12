import { Card } from "./ui/Card";

const rows = [
  ["Monday", "1", "DBMS", "Dr. Aarav Raman", "A-201", "9:30 AM", "10:30 AM"],
  ["Monday", "2", "Algorithms", "Dr. Mira Iyer", "B-204", "10:30 AM", "11:30 AM"],
  ["Tuesday", "3", "Machine Learning", "Dr. Dev Mehta", "Lab 2", "2:00 PM", "3:00 PM"],
];

export function TimetableView() {
  return (
    <Card className="p-5">
      <h3 className="text-xl font-black text-white">Today’s Timetable</h3>
      <div className="mt-4 grid gap-3">
        {rows.map(([day, period, subject, faculty, room, start, end]) => (
          <div key={`${day}-${period}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[90px_70px_1fr_1fr_100px_150px]">
            <span className="text-cyan">{day}</span><span className="text-slateText">P{period}</span><span className="font-bold text-white">{subject}</span><span className="text-slateText">{faculty}</span><span className="text-slateText">{room}</span><span className="text-slateText">{start} - {end}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
