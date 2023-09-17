const {
  checkIfFileMusicExists,
  getAllSongs,
  createSong,
  removeSong,
} = require("../model/song");

const fs = require("fs");

exports.canciones = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    res.json(canciones);
  } catch (error) {
    console.log(`Error del parte del servidor ${error}`);
    res.json(error);
  }
};

exports.insertSong = async (req, res) => {
  try {
    const files = req.files; // Obtener los archivos subidos
    const insertedSongs = []; // Almacenar los nombres de las canciones insertadas

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.filename;
      const filepath = file.path;

      // Normalizar la ruta del archivo para garantizar compatibilidad entre sistemas operativos
      const filepathNormalized = filepath.replace(/\\/g, "/");

      // Verifica si la cancion ya existe
      const songExists = await checkIfFileMusicExists(filename);
      if (songExists) {
        return res.send(`La canción '${filename}' ya existe`);
      }

      await createSong(filename, filepathNormalized);

      insertedSongs.push(filename);
    }

    if (insertedSongs.length > 0) {
      console.log("Se completó la carga de las canciones: ", insertedSongs);
    } else {
      console.log("No se insertaron nuevas canciones");
    }

    res.redirect("/canciones");
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};

exports.deleteSong = async (req, res) => {
  const { id } = req.params;
  try {
    const song = await removeSong(id);
    if (song) {
      const filepath = song[0].filepath;

      fs.unlink(filepath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Archivo eliminado exitosamente");
        }
      });
      res.redirect("/canciones");
    } else {
      console.log("La cancion no existe");
    }
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};
