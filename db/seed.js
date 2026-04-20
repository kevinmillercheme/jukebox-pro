import db from "#db/client";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import bcrypt from "bcrypt";

await db.connect();
await seed();
await db.end();

console.log("🌱 Database seeded.");

async function seed() {

  const users = await Promise.all([
    createUser("alice", "password1"),
    createUser("bob", "password2"),
  ]);

  const tracks = [];

  for (let i = 1; i <= 50; i++) {
    const track = await createTrack(
      `Track ${i}`,
      i * 50000
    );

    tracks.push(track);
  }

  const playlists = [];

  for (const user of users) {
    for (let i = 1; i <= 5; i++) {
      const playlist = await createPlaylist(
        `${user.username} Playlist ${i}`,
        "lorem ipsum",
        user.id
      );

      playlists.push(playlist);
    }
  }

  let trackIndex = 0;

  for (const playlist of playlists) {
    for (let i = 0; i < 5; i++) {
      const track = tracks[trackIndex % tracks.length];
      trackIndex++;

      await createPlaylistTrack(
        playlist.id,
        track.id
      );
    }
  }
}

async function createUser(username, password) {
  const hash = await bcrypt.hash(password, 10);

  const res = await db.query(
    `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING *
    `,
    [username, hash]
  );

  return res.rows[0];
}