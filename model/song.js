const { pool } = require("../database/db");

const checkIfFileMusicExists = async (filename) => {
  try {
    const [song] = await pool.execute(
      "SELECT filename FROM canciones WHERE filename = ?",
      [filename]
    );
    return song.length > 0;
  } catch (error) {
    console.error("Error en checkIfMusicExists:", error);
    throw error; // O manejar el error de alguna otra manera
  }
};

const createSong = async (filename, filepath) => {
  try {
    await pool.query(
      "INSERT INTO canciones (filename, filepath) VALUES (?, ?)",
      [filename, filepath]
    );
  } catch (error) {
    console.error("Error en createSong:", error);
    throw error;
  }
};

const getAllSongs = async () => {
  try {
    const [canciones] = await pool.execute("SELECT * FROM canciones");
    return canciones;
  } catch (error) {
    console.error("Error en getAllSongs:", error);
    throw error;
  }
};

const removeSong = async (id) => {
  try {
    const [songExist] = await pool.execute(
      "SELECT filepath FROM canciones WHERE id = ?",
      [id]
    );
    if (!songExist) {
      console.log("La cancion no existe");
    }
    await pool.execute("DELETE FROM canciones WHERE id = ?", [id]);
    return songExist;
  } catch (error) {
    console.error("Error en removeSong:", error);
    throw error;
  }
};

module.exports = {
  checkIfFileMusicExists,
  createSong,
  getAllSongs,
  removeSong,
};
