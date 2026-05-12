import { apiGet } from "./api";

export async function fetchStudentDashboard(token) {
  return apiGet("/student/dashboard", token);
}

export async function fetchTeacherDashboard(token) {
  return apiGet("/teacher/dashboard", token);
}

export async function fetchAdminDashboard(token) {
  return apiGet("/admin/dashboard", token);
}
