import bcrypt from "bcrypt";
import { writeJSON } from "./src/db.js";

// Fictional demo data only. Demo passwords are printed below and are NOT for production.
const STUDENT_PASSWORD = "Student123!";
const DELEGATE_PASSWORD = "Delegate123!";
const STAFF_PASSWORD = "Staff123!";
const ADMIN_PASSWORD = "Admin123!";

const names = ["Student One", "Student Two", "Student Three", "Student Four", "Student Five"];
const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
const delegateHash = await bcrypt.hash(DELEGATE_PASSWORD, 10);
const staffHash = await bcrypt.hash(STAFF_PASSWORD, 10);
const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
const now = new Date().toISOString();

writeJSON(
  "students",
  names.map((fullName, i) => ({
    id: i + 1,
    fullName,
    sex: i % 2 === 0 ? "Male" : "Female",
    department: "Software Engineering",
    level: "Level 2",
    matricule: `SIU00${i + 1}`,
    admissionYear: "2025",
    passwordHash: studentHash,
    createdAt: now,
  }))
);

writeJSON("delegates", [
  {
    id: 1,
    delegateId: "DEL001",
    fullName: "Demo Delegate",
    department: "Software Engineering",
    level: "Level 2",
    passwordHash: delegateHash,
  },
]);

// `role` drives permissions; `userType` keeps the charter's user type for display.
writeJSON("staffAndAdmin", [
  {
    id: 1,
    staffId: "STF001",
    role: "staff",
    userType: "Lecturer",
    fullName: "Demo Lecturer",
    department: "Software Engineering",
    passwordHash: staffHash,
  },
  {
    id: 2,
    staffId: "ADM001",
    role: "admin",
    userType: "Administration",
    fullName: "Demo Administrator",
    department: null,
    passwordHash: adminHash,
  },
]);

// [name, department, level, assigned lecturer]. STF001 teaches only some courses,
// so the "own courses only" rule can be demonstrated. An admin can assign the rest.
const courses = [
  ["Mathematics", "Software Engineering", "Level 2", null],
  ["Database Systems", "Software Engineering", "Level 2", "STF001"],
  ["Web Development", "Software Engineering", "Level 2", "STF001"],
  ["Data Structures and Algorithms", "Software Engineering", "Level 2", null],
  ["Linux Fundamentals", "Software Engineering", "Level 2", null],
  ["Software Engineering", "Software Engineering", "Level 2", "STF001"],
  ["Programming Fundamentals", "Software Engineering", "Level 1", null],
  ["Network Security Basics", "Cybersecurity", "Level 1", null],
  ["Linux Fundamentals", "Cybersecurity", "Level 1", null],
  ["Principles of Management", "Business", "Level 1", null],
  ["Business Mathematics", "Business", "Level 1", null],
];

writeJSON(
  "courses",
  courses.map(([name, department, level, staffId], i) => ({
    id: i + 1,
    name,
    department,
    level,
    staffId,
    active: true,
    createdBy: { id: "seed", role: "admin" },
    createdAt: now,
  }))
);

writeJSON("classSessions", []);
writeJSON("attendanceSessions", []);
writeJSON("disputes", []);
writeJSON("goals", []);

writeJSON("announcements", [
  {
    id: 1,
    tag: "ACADEMIC",
    tagColor: "",
    title: "Welcome to the new academic session!",
    body: "Stay connected to SIU One for important academic updates.",
    author: "University Administration",
    createdBy: { id: "seed", role: "admin" },
    createdAt: now,
  },
  {
    id: 2,
    tag: "COMMUNITY",
    tagColor: "orange",
    title: "Welcome back, Doers!",
    body: "Let's make this academic year productive and memorable.",
    author: "Student Board",
    createdBy: { id: "seed", role: "admin" },
    // Slightly older, so it lists second (newest first).
    createdAt: new Date(Date.parse(now) - 60_000).toISOString(),
  },
]);

// Demo assessments are dated relative to the seeding day so they show as upcoming.
// Weekend dates move to the following Monday.
function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

writeJSON(
  "events",
  [
    ["Database Systems", 14, "10:00"],
    ["Software Engineering", 17, "14:00"],
    ["Mathematics", 21, "09:00"],
  ].map(([title, days, startTime], i) => ({
    id: i + 1,
    title,
    eventDate: daysFromNow(days),
    startTime,
    createdBy: { id: "seed", role: "admin" },
    createdAt: now,
  }))
);

console.log("Seeded backend/data.");
console.log(`  Students SIU001-SIU005  password: ${STUDENT_PASSWORD}`);
console.log(`  Delegate DEL001         password: ${DELEGATE_PASSWORD}`);
console.log(`  Staff    STF001         password: ${STAFF_PASSWORD}`);
console.log(`  Admin    ADM001         password: ${ADMIN_PASSWORD}`);
