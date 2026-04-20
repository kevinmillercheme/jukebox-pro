import express from "express";
const router = express.Router();

import {
  createPlaylist,
  getPlaylistById,
  getPlaylistsByUserId,
} from "#db/queries/playlists";

import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import { requireUser } from "../middleware/auth.js";

router.use(requireUser);

router.get("/", async (req, res) => {
  const playlists = await getPlaylistsByUserId(req.user.id);
  res.send(playlists);
});

router.post("/", async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send("Request body requires: name, description");
  }

  const playlist = await createPlaylist(name, description, req.user.id);
  res.status(201).send(playlist);
});

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);

  if (!playlist) {
    return res.status(404).send("Playlist not found.");
  }

  req.playlist = playlist;
  next();
});

router.get("/:id", async (req, res) => {
  if (req.playlist.user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  res.send(req.playlist);
});

router.get("/:id/tracks", async (req, res) => {
  if (req.playlist.user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  const tracks = await getTracksByPlaylistId(req.playlist.id);
  res.send(tracks);
});

router.post("/:id/tracks", async (req, res) => {
  const { trackId } = req.body;

  if (!trackId) {
    return res.status(400).send("Request body requires: trackId");
  }

  if (req.playlist.user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
  res.status(201).send(playlistTrack);
});

export default router;