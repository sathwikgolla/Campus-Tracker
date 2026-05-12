import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const students = ["Rahul Verma", "Anjali Reddy", "Karthik Rao", "Nila Shah"];

export function AttendancePanel() {
  const [records, setRecords] = useState(Object.fromEntries(students.map((s) => [s, "Present"])));
  const percentage = Math.round((Object.values(records).filter((x) => x === "Present").length / students.length) * 100);
  return (
    <Card className="p-5">
      <h3 className="text-xl font-black text-white">Attendance</h3>
      <p className="mt-2 text-sm text-slateText">Current class attendance: <span className="text-cyan">{percentage}%</span></p>
      <div className="mt-5 grid gap-3">
        {students.map((student) => (
          <div key={student} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <span className="font-semibold text-white">{student}</span>
            <button onClick={() => setRecords((r) => ({ ...r, [student]: r[student] === "Present" ? "Absent" : "Present" }))} className={`rounded-full px-3 py-1 text-sm ${records[student] === "Present" ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`}>{records[student]}</button>
          </div>
        ))}
      </div>
      <Button className="mt-5">Submit Attendance</Button>
    </Card>
  );
}
