import express from "express";
import { requireUser } from "../middleware/auth.js";

import { getTracks, getTrackById } from "#db/queries/tracks";
import db from "#db/client";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tracks = await getTracks();
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);

    if (!track) return res.status(404).send("Track not found.");

    res.json(track);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/playlists", requireUser, async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);

    if (!track) return res.status(404).send("Track not found.");

    const sql = `
      SELECT playlists.*
      FROM playlists
      JOIN playlists_tracks
        ON playlists.id = playlists_tracks.playlist_id
      WHERE playlists_tracks.track_id = $1
        AND playlists.user_id = $2
    `;

    const { rows } = await db.query(sql, [
      req.params.id,
      req.user.id,
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;