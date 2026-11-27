// A class session is one scheduled meeting of a course. Attendance records point at it.
// One meeting per course per trimester + week + date. Cancelled sessions stay in the
// file (cancelledBy / cancelledAt) but no longer count: they are hidden, take no
// attendance and free their slot.
import { readJSON, writeJSON, nextId } from "./db.js";

export const isCancelled = (session) => Boolean(session.cancelledAt);

export function findClassSession(details) {
  return readJSON("classSessions").find(
    (s) =>
      !isCancelled(s) &&
      s.courseId === details.courseId &&
      s.trimester === details.trimester &&
      s.week === details.week &&
      s.sessionDate === details.sessionDate
  );
}

export function createClassSession(details, user) {
  const sessions = readJSON("classSessions");
  const session = {
    id: nextId(sessions),
    courseId: details.courseId,
    trimester: details.trimester,
    week: details.week,
    sessionDate: details.sessionDate,
    startTime: details.startTime || null,
    createdBy: { id: user.matricule, role: user.role },
    createdAt: new Date().toISOString(),
  };
  sessions.push(session);
  writeJSON("classSessions", sessions);
  return session;
}

export function cancelClassSession(id, user) {
  const sessions = readJSON("classSessions");
  const session = sessions.find((s) => s.id === id);
  // Sensitive change: record who cancelled it and when.
  session.cancelledBy = { id: user.matricule, role: user.role };
  session.cancelledAt = new Date().toISOString();
  writeJSON("classSessions", sessions);
}
