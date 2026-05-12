import { apiGet } from "./api";
import { timetable } from "../data/faculty";

export async function fetchTimetable(token) {
  try {
    const response = await apiGet("/timetable", token);
    return response.data || [];
  } catch {
    return timetable;
  }
}

export async function fetchTeacherTimetable(teacherId, token) {
  try {
    const response = await apiGet(`/timetable/teacher/${teacherId}`, token);
    return response.data || [];
  } catch {
    return timetable.filter((entry) => entry.teacherName === teacherId);
  }
}
