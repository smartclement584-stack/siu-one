// Shared academic vocabulary. The values match what the registration form and the
// delegate attendance screen already send.
export const DEPARTMENTS = ["Software Engineering", "Cybersecurity", "Business"];
export const LEVELS = ["Level 1", "Level 2", "Level 3"];
export const TRIMESTERS = ["Trimester 1", "Trimester 2", "Trimester 3"];
export const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
export const STATUSES = ["Present", "Absent", "Late"];

export const clean = (v) => (typeof v === "string" ? v.trim() : "");

// A "class" is one department at one level.
export const sameClass = (a, b) =>
  Boolean(a && b) && a.department === b.department && a.level === b.level;

// Strict YYYY-MM-DD that is also a real calendar day (rejects 2026-02-30).
export function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
