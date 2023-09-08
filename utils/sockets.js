const socketIO = require("socket.io");
const fs = require("fs").promises;
const path = require("path");
const { getAllAds } = require("../database/db");

module.exports = (server, baseDir) => {
  const io = socketIO(server, {
    reconnection: true,
    reconnectionDelay: 1000,
  });

  const clients = {};

  const recentlyPlayedSongs = [];
  const recentlyPlayedAds = [];

  const MAX_RECENT_ITEMS = 120;

  const apiData = [];

  io.on("connection", (socket) => {
    console.log("Cliente conectado");

    clients[socket.id] = socket;
    const numClients = Object.keys(clients).length;
    console.log(`Número de clientes conectados: ${numClients}`);

    const getSongs = async () => {
      const carpetaMusica = path.join(baseDir, "public", "music");
      try {
        const archivos = await fs.readdir(carpetaMusica);
        return archivos.map((archivo) =>
          path.relative(
            path.join(baseDir, "public"),
            path.join(carpetaMusica, archivo)
          )
        );
      } catch (err) {
        console.log("Error al leer la carpeta de música:", err);
        return [];
      }
    };

    const getAds = async () => {
      const carpetaAudios = path.join(baseDir, "public", "audios");
      try {
        const archivos = await fs.readdir(carpetaAudios);
        const rutasRelativas = archivos.map((archivo) =>
          path.relative(
            path.join(baseDir, "public"),
            path.join(carpetaAudios, archivo)
          )
        );
        return rutasRelativas;
      } catch (err) {
        console.log("Error al leer la carpeta de audios:", err);
        return [];
      }
    };

    const obtenerAudioAleatoria = (array) => {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    };

    const obtenerAudioAleatoriaSinRepetir = (array, recentlyPlayed) => {
      const availableOptions = array.filter(
        (item) => !recentlyPlayed.includes(item)
      );

      if (availableOptions.length === 0) {
        // Si ya se han reproducido todas las opciones, reiniciar el registro
        recentlyPlayed.length = 0;
        return obtenerAudioAleatoriaSinRepetir(array, recentlyPlayed);
      }

      const randomItem = obtenerAudioAleatoria(availableOptions);
      recentlyPlayed.push(randomItem);

      if (recentlyPlayed.length > MAX_RECENT_ITEMS) {
        recentlyPlayed.shift();
      }

      return randomItem;
    };

    socket.on("play", () => {
      getSongs()
        .then((songs) => {
          const randomSong = obtenerAudioAleatoriaSinRepetir(
            songs,
            recentlyPlayedSongs
          );
          io.emit("play", randomSong);
        })
        .catch((error) => {
          console.error("Error al obtener las canciones:", error);
        });
    });

    socket.on("ads", () => {
      getAds()
        .then((ads) => {
          const randomAd = obtenerAudioAleatoriaSinRepetir(
            ads,
            recentlyPlayedAds
          );

          io.emit("playAd", randomAd);
        })
        .catch((error) => {
          console.error("Error al obtener el anuncio", error);
        });
    });

    socket.on("pause", () => {
      io.emit("pause");
    });

    socket.on("anuncios", async () => {
      const data = await getAllAds();
      console.log("enviando data", data);
      socket.emit("anuncios", data);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      delete clients[socket.id];
    });
  });
};
