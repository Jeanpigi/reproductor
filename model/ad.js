const { pool } = require("../database/db");

const checkIfFileAdExists = async (filename) => {
  try {
    const [ad] = await pool.execute(
      "SELECT filename FROM anuncios WHERE filename = ?",
      [filename]
    );
    return ad.length > 0;
  } catch (error) {
    console.error("Error en checkIfFileAdExists:", error);
    throw error; // O manejar el error de alguna otra manera
  }
};

const createAd = async (filename, filepath, selectedDia) => {
  try {
    await pool.query(
      "INSERT INTO anuncios (filename, filepath, dia) VALUES (?, ?, ?)",
      [filename, filepath, selectedDia]
    );
  } catch (error) {
    console.error("Error en createAd:", error);
    throw error;
  }
};

const getAllAds = async () => {
  try {
    const [anuncios] = await pool.execute("SELECT * FROM anuncios");
    return anuncios;
  } catch (error) {
    console.error("Error en getAllAds:", error);
    throw error;
  }
};

const removeAd = async (id) => {
  try {
    const [adExist] = await pool.execute(
      "SELECT filepath FROM anuncios WHERE id = ?",
      [id]
    );
    if (!adExist) {
      console.log("El anuncio no existe");
    }
    await pool.execute("DELETE FROM anuncios WHERE id = ?", [id]);
    return adExist;
  } catch (error) {
    console.error("Error en removeAd:", error);
    throw error;
  }
};

module.exports = {
  checkIfFileAdExists,
  createAd,
  getAllAds,
  removeAd,
};
