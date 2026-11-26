import { Router } from "express";
import { readJSON } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.json(readJSON("events"));
});

export default router;
