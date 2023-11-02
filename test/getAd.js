const test = require("node:test");
const assert = require("assert");
const { getAllAds } = require("../model/adLite");

test("Trayendo todas las canciones", async () => {
  const songs = await getAllAds();
  assert.ok(songs.length > 0);
});
