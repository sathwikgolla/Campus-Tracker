import campusData from "./campusData.json";
import additionalData from "./additional_50_faculty.json";

const statusCycle = ["Not Updated", "Available", "Busy", "In Class", "On Leave"];

export const statusStyles = {
  Available: "text-emerald-300 bg-emerald-500/12 border-emerald-400/25",
  Busy: "text-amber-300 bg-amber-500/12 border-amber-400/25",
  "In Class": "text-cyan-300 bg-cyan-500/12 border-cyan-400/25",
  "On Leave": "text-rose-300 bg-rose-500/12 border-rose-400/25",
  "In Meeting": "text-violet-200 bg-violet-500/12 border-violet-400/25",
  "Not Updated": "text-slate-300 bg-slate-500/12 border-slate-400/25",
};

function avatarFor(name) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

function mergeTeachers() {
  const seen = new Set();
  const merged = [];
  for (const teacher of [...(campusData.teachers || campusData.faculty || []), ...(additionalData.teachers || additionalData.faculty || [])]) {
    const key = (teacher.email || teacher.employeeId || teacher.teacherId || teacher.name || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(teacher);
  }
  return merged;
}

const mergedTeachers = mergeTeachers();
const mergedTimetable = [...(campusData.timetable || []), ...(additionalData.timetable || additionalData.timetableEntries || [])];

export const faculty = mergedTeachers.map((teacher, index) => {
  const timetable = mergedTimetable.filter((entry) => entry.teacherName === teacher.name);
  const firstClass = timetable[0];
  const status = teacher.manualStatus || statusCycle[index % statusCycle.length];
  return {
    id: index + 1,
    name: teacher.name || `Teacher ${index + 1}`,
    designation: teacher.designation || "Faculty",
    department: teacher.department || firstClass?.departmentBranch || "Unassigned",
    cabin: teacher.cabin || "Cabin not assigned",
    location: firstClass?.room || teacher.cabin || "Cabin not assigned",
    status,
    timings: firstClass ? `${firstClass.startTime} - ${firstClass.endTime}` : "No timetable available",
    subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [],
    email: teacher.email || "",
    phone: teacher.phone || "",
    avatar: teacher.avatar || avatarFor(teacher.name || `Teacher ${index + 1}`),
    timetable,
  };
});

export const departmentsList = [...new Set(faculty.map((item) => item.department).filter(Boolean))];
export const statusesList = ["Available", "Busy", "In Class", "On Leave", "In Meeting", "Not Updated"];
export const locationsList = [...new Set([...faculty.map((item) => item.cabin), ...mergedTimetable.map((item) => item.room)].filter(Boolean))].slice(0, 120);
export const timetable = mergedTimetable;
