import { apiGet, apiRequest } from "./api";

export async function fetchTeacherDashboard(token) {
  const response = await apiGet("/teacher/dashboard", token);
  return response.data;
}

export async function updateTeacherStatus(payload, token) {
  const response = await apiRequest("/teacher/status", { method: "PUT", token, body: payload });
  return response.data;
}

export async function createTeacherSlot(payload, token) {
  const response = await apiRequest("/teacher/slots", { method: "POST", token, body: payload });
  return response.data;
}

export async function deleteTeacherSlot(id, token) {
  const response = await apiRequest(`/teacher/slots/${id}`, { method: "DELETE", token });
  return response.data;
}
