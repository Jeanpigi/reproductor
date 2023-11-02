const test = require("node:test");
const assert = require("assert");
const { getAllSongs } = require("../model/songLite");

test("Trayendo todas las canciones", async () => {
  const songs = await getAllSongs();
  assert.ok(songs.length > 0);
});
