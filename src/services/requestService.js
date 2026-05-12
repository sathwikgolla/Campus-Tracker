import { apiGet, apiRequest } from "./api";

export async function fetchTeacherRequests(token) {
  const response = await apiGet("/requests/teacher", token);
  return response.data || [];
}

export async function acceptTeacherRequest(id, token) {
  const response = await apiRequest(`/requests/${id}/accept`, { method: "PUT", token });
  return response.data;
}

export async function rejectTeacherRequest(id, token) {
  const response = await apiRequest(`/requests/${id}/reject`, { method: "PUT", token });
  return response.data;
}

export async function createFacultyRequest(payload, token) {
  const response = await apiRequest("/requests", { method: "POST", token, body: payload });
  return response.data;
}
