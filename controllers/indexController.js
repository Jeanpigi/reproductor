const {
  checkIfUsernameExists,
  createUser,
  getUserByUsername,
  comparePasswords,
  checkIfFileMusicExists,
  createSong,
  getAllSongs,
  removeSong,
  checkIfFileAdExists,
  createAd,
  getAllAds,
  removeAd,
} = require("../database/db");

const fs = require("fs");
const jwt = require("jsonwebtoken");

// Signup
exports.signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Verifica si el usuario ya existe
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
      console.log("El nombre de usuario ya está en uso");
      return res.redirect("/signup");
    }

    // Crea un nuevo usuario
    await createUser(username, password);
    res.redirect("/login");
  } catch (error) {
    console.log(`Error que se está presentando es ${error}`);
    return res.redirect("/signup");
  }
};

// Consulta de datos de usuario
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      console.log("El nombre de usuario es incorrecto");
      return res.redirect("/login");
    }

    const isPasswordCorrect = await comparePasswords(
      password,
      user[0].password
    );

    if (!isPasswordCorrect) {
      console.log("La contraseña es incorrecto");
      return res.redirect("/login");
    }

    // req.session.user = { username };

    // Firmar el token con un objeto en lugar de una cadena
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);

    res.redirect("/canciones");
  } catch (error) {
    console.log(`Error que se está presentando es ${error}`);
    return res.redirect("/login");
  }
};

exports.canciones = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    res.json(canciones);
  } catch (error) {
    console.log(`Error del parte del servidor ${error}`);
    res.json(error);
  }
};

exports.getAll = async (req, res) => {
  try {
    const canciones = await getAllSongs();
    const anuncios = await getAllAds();
    res.render("songs", { canciones, anuncios });
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
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

      // Verifica si la cancion ya existe
      const songExists = await checkIfFileMusicExists(filename);
      if (songExists) {
        return res.send(`La canción '${filename}' ya existe`);
      }

      // Crea un nuevo usuario
      await createSong(filename, filepath);

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

exports.anuncios = async (req, res) => {
  try {
    const anuncios = await getAllAds();
    res.json(anuncios);
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

exports.getAudios = async (req, res) => {
  try {
    const query = "SELECT * FROM anuncios";
    const [rows] = await pool.execute(query);
    res.render("test", { rows });
  } catch (error) {
    console.error(error);
    res.send("Error del parte del servidor");
  }
};

exports.insertAudios = async (req, res) => {
  try {
    const files = req.files; // Obtener los archivos subidos (usar req.files en lugar de req.file)
    const insertedAudios = []; // Almacenar los nombres de los audios insertados

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.filename;
      const filepath = file.path;

      // Verifica si la cancion ya existe
      const adExists = await checkIfFileAdExists(filename);
      if (adExists) {
        return res.send(`El anuncio '${filename}' ya existe`);
      }

      // Crea un nuevo usuario
      await createAd(filename, filepath);

      insertedAudios.push(filename);
    }

    if (insertedAudios.length > 0) {
      console.log("Se completó la carga de los audios:", insertedAudios);
    } else {
      console.log("No se insertaron nuevos audios");
    }

    res.redirect("/canciones");
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};

exports.deleteAudios = async (req, res) => {
  const { id } = req.params;
  try {
    const anuncio = await removeAd(id);
    if (anuncio) {
      const filepath = anuncio[0].filepath;

      fs.unlink(filepath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Archivo eliminado exitosamente");
        }
      });
      res.redirect("/canciones");
    } else {
      console.log("No existe el anuncio");
    }
  } catch (error) {
    console.error(
      `Ocurrió un error al momento de insertar en la base de datos ${error}`
    );
    res.redirect("/canciones");
  }
};
