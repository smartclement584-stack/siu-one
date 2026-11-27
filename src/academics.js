// Mirrors backend/src/academics.js; the server validates against its own copy.
export const DEPARTMENTS = ["Software Engineering", "Cybersecurity", "Business"];
export const LEVELS = ["Level 1", "Level 2", "Level 3"];
export const TRIMESTERS = ["Trimester 1", "Trimester 2", "Trimester 3"];
export const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
export const STATUSES = ["Present", "Absent", "Late"];
