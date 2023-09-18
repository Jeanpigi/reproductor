const { getAllSongs } = require("../model/song");
const { getAllAds } = require("../model/ad");

const getAll = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    const anuncios = await getAllAds();
    res.render("songs", { canciones, anuncios });
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

module.exports = { getAll };
