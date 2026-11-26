import bcrypt from "bcrypt";
import { writeJSON } from "./src/db.js";

// Fictional demo data only. Demo passwords are printed below and are NOT for production.
const STUDENT_PASSWORD = "Student123!";
const DELEGATE_PASSWORD = "Delegate123!";

const names = ["Student One", "Student Two", "Student Three", "Student Four", "Student Five"];
const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
const delegateHash = await bcrypt.hash(DELEGATE_PASSWORD, 10);
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

writeJSON(
  "courses",
  [
    "Mathematics",
    "Database Systems",
    "Web Development",
    "Data Structures and Algorithms",
    "Linux Fundamentals",
    "Software Engineering",
  ].map((name, i) => ({ id: i + 1, name }))
);

writeJSON("attendanceSessions", []);
writeJSON("goals", []);

writeJSON("announcements", [
  {
    id: 1,
    tag: "ACADEMIC",
    tagColor: "",
    title: "Welcome to the new academic session!",
    body: "Stay connected to SIU One for important academic updates.",
    author: "University Administration",
  },
  {
    id: 2,
    tag: "COMMUNITY",
    tagColor: "orange",
    title: "Welcome back, Doers!",
    body: "Let's make this academic year productive and memorable.",
    author: "Student Board",
  },
]);

writeJSON("events", [
  { id: 1, day: "MON", date: "23", title: "Database Systems", time: "10:00 AM" },
  { id: 2, day: "WED", date: "25", title: "Software Engineering", time: "2:00 PM" },
  { id: 3, day: "FRI", date: "27", title: "Mathematics", time: "9:00 AM" },
]);

console.log("Seeded backend/data.");
console.log(`  Students SIU001-SIU005  password: ${STUDENT_PASSWORD}`);
console.log(`  Delegate DEL001         password: ${DELEGATE_PASSWORD}`);
