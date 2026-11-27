// Admin-managed content (announcements, calendar events): everyone signed in reads,
// only admins write. Deleting keeps the entry and logs who removed it.
import { Router } from "express";
import { readJSON, writeJSON, nextId } from "./db.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import { clean } from "./academics.js";

export function contentRouter({ file, label, fields, validate, compare, toResponse }) {
  const router = Router();
  const adminOnly = [requireAuth, requireRole("admin")];
  const stamp = (req) => ({ id: req.user.matricule, role: req.user.role });

  // Only the listed fields are ever taken from a request.
  const pick = (body, current = {}) =>
    Object.fromEntries(
      fields.map((f) => [f, body[f] === undefined ? (current[f] ?? "") : clean(body[f])])
    );

  const findLive = (items, id) => items.find((i) => i.id === Number(id) && !i.deletedAt);
  const notFound = (res) => res.status(404).json({ error: `${label} not found.` });

  router.get("/", requireAuth, (req, res) => {
    const items = readJSON(file).filter((i) => !i.deletedAt);
    res.json(items.sort(compare).map(toResponse));
  });

  router.post("/", ...adminOnly, (req, res) => {
    const values = pick(req.body ?? {});
    const error = validate(values);
    if (error) return res.status(400).json({ error });

    const items = readJSON(file);
    const item = {
      id: nextId(items),
      ...values,
      createdBy: stamp(req),
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    writeJSON(file, items);
    res.status(201).json(toResponse(item));
  });

  router.patch("/:id", ...adminOnly, (req, res) => {
    const items = readJSON(file);
    const item = findLive(items, req.params.id);
    if (!item) return notFound(res);

    const values = pick(req.body ?? {}, item);
    const error = validate(values);
    if (error) return res.status(400).json({ error });

    Object.assign(item, values, { updatedBy: stamp(req), updatedAt: new Date().toISOString() });
    writeJSON(file, items);
    res.json(toResponse(item));
  });

  router.delete("/:id", ...adminOnly, (req, res) => {
    const items = readJSON(file);
    const item = findLive(items, req.params.id);
    if (!item) return notFound(res);

    Object.assign(item, { deletedBy: stamp(req), deletedAt: new Date().toISOString() });
    writeJSON(file, items);
    res.status(204).end();
  });

  return router;
}

// First "<name> is required / too long" problem for [field, name, maxLength] rules.
export function checkText(values, rules) {
  for (const [field, name, max] of rules) {
    if (!values[field]) return `${name} is required.`;
    if (values[field].length > max) return `${name} is too long (${max} characters max).`;
  }
  return null;
}
