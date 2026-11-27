export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "siuToken";

// "Remember me" -> localStorage (survives closing the browser);
// otherwise sessionStorage (survives refresh, cleared when the tab closes).
export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token, remember = true) {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable: the token just won't persist
  }
}

export function logout() {
  setToken("");
}

// Fired when the server rejects a token we sent, so the app can drop the session.
export const UNAUTHORIZED_EVENT = "siu:unauthorized";

// Shows an error unless it was a 401 (the session is already being cleared and
// the route guard redirects to the login screen).
export function reportError(error) {
  if (error.status !== 401) alert(error.message);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getToken() : "";
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
    const error = new Error(data?.error || `Request failed (${response.status}).`);
    error.status = response.status;
    if (response.status === 401 && token) {
      setToken("");
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw error;
  }
  return data;
}

const enc = encodeURIComponent;

// Auth (login/register never send a stored token, so a stale one can't mask a bad password)
export async function login(matricule, password, remember = false) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { matricule, password },
    auth: false,
  });
  setToken(data.token, remember);
  return data;
}

export const register = (profile) =>
  request("/auth/register", { method: "POST", body: profile, auth: false });

export async function delegateLogin(delegateId, password) {
  const data = await request("/auth/delegate-login", {
    method: "POST",
    body: { delegateId, password },
    auth: false,
  });
  setToken(data.token, false);
  return data;
}

export async function staffLogin(staffId, password) {
  const data = await request("/auth/staff-login", {
    method: "POST",
    body: { staffId, password },
    auth: false,
  });
  setToken(data.token, false);
  return data;
}

export const getMe = () => request("/auth/me");

// Data
export const getStudents = () => request("/students");
export const getSessions = () => request("/attendance/sessions");
export const saveSession = (session) =>
  request("/attendance/sessions", { method: "POST", body: session });
export const getStudentAttendance = (matricule) =>
  request(`/attendance/student/${enc(matricule)}`);
export const getAnnouncements = () => request("/announcements");
export const createAnnouncement = (item) =>
  request("/announcements", { method: "POST", body: item });
export const updateAnnouncement = (id, changes) =>
  request(`/announcements/${enc(id)}`, { method: "PATCH", body: changes });
export const deleteAnnouncement = (id) =>
  request(`/announcements/${enc(id)}`, { method: "DELETE" });

export const getEvents = () => request("/events");
export const createEvent = (item) => request("/events", { method: "POST", body: item });
export const updateEvent = (id, changes) =>
  request(`/events/${enc(id)}`, { method: "PATCH", body: changes });
export const deleteEvent = (id) => request(`/events/${enc(id)}`, { method: "DELETE" });

export const getGoal = (matricule) => request(`/goals/${enc(matricule)}`);
export const saveGoal = (matricule, goal) =>
  request(`/goals/${enc(matricule)}`, { method: "PUT", body: goal });
export const getCourses = () => request("/courses");
export const createCourse = (course) =>
  request("/courses", { method: "POST", body: course });
export const updateCourse = (id, changes) =>
  request(`/courses/${enc(id)}`, { method: "PATCH", body: changes });
export const getStaff = () => request("/staff");

export const getClassSessions = () => request("/class-sessions");
export const createClassSession = (session) =>
  request("/class-sessions", { method: "POST", body: session });
export const cancelClassSession = (id) =>
  request(`/class-sessions/${enc(id)}`, { method: "DELETE" });

// status: "open" | "approved" | "rejected" | "all" (omit for the role's default)
export const getDisputes = (status) =>
  request(status ? `/disputes?status=${enc(status)}` : "/disputes");
export const createDispute = (dispute) =>
  request("/disputes", { method: "POST", body: dispute });
export const resolveDispute = (id, decision) =>
  request(`/disputes/${enc(id)}`, { method: "PATCH", body: decision });
