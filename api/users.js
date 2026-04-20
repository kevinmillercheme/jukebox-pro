import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "#db/client";

const router = express.Router();
export default router;

const JWT_SECRET = "super-secret";

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.sendStatus(400);
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const {
      rows: [user],
    } = await db.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING id`,
      [username, hash]
    );

    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    return res.status(201).send(token);
  } catch {
    return res.sendStatus(400);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.sendStatus(400);
  }

  const {
    rows: [user],
  } = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );

  if (!user) return res.sendStatus(400);

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.sendStatus(400);

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return res.status(200).send(token);
});