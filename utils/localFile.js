const path = require("path");
const fs = require("fs").promises;
const basePublicDir = path.join(__dirname, "../public");

async function getDecemberSongs() {
  const decemberMusicFolder = path.join(basePublicDir, "diciembre");
  const files = await fs.readdir(decemberMusicFolder, { withFileTypes: true });
  return files
    .filter((dirent) => dirent.isFile())
    .map((dirent) => path.join(decemberMusicFolder, dirent.name))
    .map((file) => path.relative(__dirname, file));
}

module.exports = {
  getLocalSongs,
  getLocalAds,
  getDecemberSongs,
};
