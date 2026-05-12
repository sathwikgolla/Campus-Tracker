import { apiGet, apiRequest } from "./api";

export async function fetchNotifications(token) {
  const response = await apiGet("/notifications", token);
  return response.data || [];
}

export async function markNotificationRead(id, token) {
  return apiRequest(`/notifications/${id}/read`, { method: "PUT", token });
}

export async function markAllNotificationsRead(token) {
  return apiRequest("/notifications/read-all", { method: "PUT", token });
}

export async function deleteNotificationById(id, token) {
  return apiRequest(`/notifications/${id}`, { method: "DELETE", token });
}
