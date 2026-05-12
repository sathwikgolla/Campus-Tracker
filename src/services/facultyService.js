import { apiGet } from "./api";

export async function fetchFaculty(params = {}, token) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value)).toString();
  const response = await apiGet(`/faculty${query ? `?${query}` : ""}`, token);
  return response.data || [];
}

export async function fetchFacultyById(id, token) {
  const response = await apiGet(`/faculty/${id}`, token);
  return response.data;
}
