const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");

let MAX_RECENT_ITEMS = 0;
let MAX_RECENT_ITEMS_ADS = 0;

async function getNumberMusic() {
  try {
    const songs = await getAllSongs();
    MAX_RECENT_ITEMS = songs.length;
  } catch (error) {
    console.error("Error al obtener canciones locales:", error);
    MAX_RECENT_ITEMS = 0;
  }
  return MAX_RECENT_ITEMS;
}

async function getNumberAds() {
  try {
    const ads = await getAllAds();
    MAX_RECENT_ITEMS_ADS = ads.length;
  } catch (error) {
    console.error("Error al obtener anuncios locales:", error);
    MAX_RECENT_ITEMS_ADS = 0;
  }
  return MAX_RECENT_ITEMS_ADS;
}

module.exports = { getNumberMusic, getNumberAds };
