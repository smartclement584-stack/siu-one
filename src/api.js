export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "siuToken";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable: the token just won't persist
  }
}

export function logout() {
  setToken("");
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status}).`);
  }
  return data;
}

const enc = encodeURIComponent;

// Auth
export async function login(matricule, password) {
  const data = await request("/auth/login", { method: "POST", body: { matricule, password } });
  setToken(data.token);
  return data;
}

export const register = (profile) =>
  request("/auth/register", { method: "POST", body: profile });

export async function delegateLogin(delegateId, password) {
  const data = await request("/auth/delegate-login", {
    method: "POST",
    body: { delegateId, password },
  });
  setToken(data.token);
  return data;
}

// Data
export const getStudents = () => request("/students");
export const getSessions = () => request("/attendance/sessions");
export const saveSession = (session) =>
  request("/attendance/sessions", { method: "POST", body: session });
export const getStudentAttendance = (matricule) =>
  request(`/attendance/student/${enc(matricule)}`);
export const getAnnouncements = () => request("/announcements");
export const getEvents = () => request("/events");
export const getGoal = (matricule) => request(`/goals/${enc(matricule)}`);
export const saveGoal = (matricule, goal) =>
  request(`/goals/${enc(matricule)}`, { method: "PUT", body: goal });
export const getCourses = () => request("/courses");
