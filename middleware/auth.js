import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret";

export function requireUser(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) return res.sendStatus(401);

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.sendStatus(401);

  try {
    req.user = jwt.verify(parts[1], JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(401);
  }
}