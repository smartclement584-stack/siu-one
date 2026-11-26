import { Router } from "express";
import bcrypt from "bcrypt";
import { readJSON, writeJSON, nextId } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();
const SEXES = ["Male", "Female"];

const publicStudent = ({ passwordHash, ...rest }) => rest;
const clean = (v) => (typeof v === "string" ? v.trim() : "");

// Same message for unknown user and wrong password: don't reveal which accounts exist.
const BAD_CREDENTIALS = { error: "Invalid credentials." };

router.post("/register", async (req, res, next) => {
  try {
    const fullName = clean(req.body.fullName);
    const sex = clean(req.body.sex);
    const department = clean(req.body.department);
    const level = clean(req.body.level);
    const matricule = clean(req.body.matricule).toUpperCase();
    const admissionYear = clean(String(req.body.admissionYear ?? ""));
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!fullName || !sex || !department || !level || !matricule || !admissionYear || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!SEXES.includes(sex)) return res.status(400).json({ error: "Invalid sex value." });
    if (!/^\d{4}$/.test(admissionYear)) {
      return res.status(400).json({ error: "Invalid admission year." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const students = readJSON("students");
    if (students.some((s) => s.matricule === matricule)) {
      return res.status(409).json({ error: "A student with this matricule already exists." });
    }

    const student = {
      id: nextId(students),
      fullName,
      sex,
      department,
      level,
      matricule,
      admissionYear,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };
    students.push(student);
    writeJSON("students", students);
    res.status(201).json(publicStudent(student));
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const matricule = clean(req.body.matricule).toUpperCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!matricule || !password) {
      return res.status(400).json({ error: "Matricule and password are required." });
    }
    const student = readJSON("students").find((s) => s.matricule === matricule);
    if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
      return res.status(401).json(BAD_CREDENTIALS);
    }
    const token = signToken({ matricule: student.matricule, role: "student" });
    res.json({ token, student: publicStudent(student) });
  } catch (err) {
    next(err);
  }
});

router.post("/delegate-login", async (req, res, next) => {
  try {
    const delegateId = clean(req.body.delegateId).toUpperCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!delegateId || !password) {
      return res.status(400).json({ error: "Delegate ID and password are required." });
    }
    const delegate = readJSON("delegates").find((d) => d.delegateId === delegateId);
    if (!delegate || !(await bcrypt.compare(password, delegate.passwordHash))) {
      return res.status(401).json(BAD_CREDENTIALS);
    }
    const token = signToken({ matricule: delegate.delegateId, role: "delegate" });
    const { passwordHash, ...safe } = delegate;
    res.json({ token, delegate: safe });
  } catch (err) {
    next(err);
  }
});

// Source of truth for "who am I": re-reads the account from the JSON store on every call,
// so a deleted account or changed role stops working even while its JWT is still valid.
router.get("/me", requireAuth, (req, res) => {
  const { matricule, role } = req.user;
  if (role === "student") {
    const student = readJSON("students").find((s) => s.matricule === matricule);
    if (student) return res.json({ role, matricule, profile: publicStudent(student) });
  } else if (role === "delegate") {
    const delegate = readJSON("delegates").find((d) => d.delegateId === matricule);
    if (delegate) return res.json({ role, matricule, profile: publicStudent(delegate) });
  }
  res.status(401).json({ error: "Account no longer exists." });
});

export default router;
