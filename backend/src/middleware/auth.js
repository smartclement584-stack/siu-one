import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "dev-only-insecure-secret";

export function signToken({ matricule, role }) {
  return jwt.sign({ matricule, role }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

// Verifies the Bearer token and attaches req.user = { matricule, role }.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    const { matricule, role } = jwt.verify(token, secret());
    req.user = { matricule, role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have access to this resource." });
    }
    next();
  };
}

// Students may only touch their own record; delegates/admins may touch any.
export function requireSelfOrStaff(req, res, next) {
  const { role, matricule } = req.user;
  const target = String(req.params.matricule || "").trim().toUpperCase();
  if (role === "student" && matricule !== target) {
    return res.status(403).json({ error: "You can only access your own records." });
  }
  next();
}
