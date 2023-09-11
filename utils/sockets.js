const socketIO = require("socket.io");
const fs = require("fs").promises;
const path = require("path");
const { getAllSongs, getAllAds } = require("../database/db");
const moment = require("moment-timezone");

module.exports = (server, baseDir) => {
  const io = socketIO(server, {
    reconnection: true,
    reconnectionDelay: 1000,
  });

  const clients = {};

  const recentlyPlayedSongs = [];

  const MAX_RECENT_ITEMS = 120;

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

    const obtenerDiaActualEnColombia = () => {
      return moment().tz("America/Bogota").locale("es").format("ddd");
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

    const obtenerAudioAleatoriaConPrioridad = (array) => {
      const diaActual = obtenerDiaActualEnColombia();
      const opcionesPrioridad = array.filter(
        (item) => item.dia === diaActual || item.dia === "T"
      );

      if (opcionesPrioridad.length === 0) {
        return obtenerAudioAleatoriaConPrioridad(array);
      }

      const randomItem =
        opcionesPrioridad[Math.floor(Math.random() * opcionesPrioridad.length)];
      return randomItem;
    };

    socket.on("play", async () => {
      await getAllSongs()
        .then((songs) => {
          const randomSong = obtenerAudioAleatoriaSinRepetir(
            songs,
            recentlyPlayedSongs
          );

          const decodedPath = decodeURIComponent(randomSong.filepath);
          const songWithoutPublic = decodedPath.replace("public/", "");
          console.log(
            `Esta es la canción decodificada de la base de datos ${songWithoutPublic}`
          );
          io.emit("play", songWithoutPublic);
        })
        .catch((error) => {
          console.error("Error al obtener las canciones:", error);
        });
    });

    socket.on("pause", () => {
      io.emit("pause");
    });

    socket.on("ads", async () => {
      await getAllAds()
        .then((ads) => {
          const randomAd = obtenerAudioAleatoriaConPrioridad(ads);
          const decodedPath = decodeURIComponent(randomAd.filepath);
          const adWithoutPublic = decodedPath.replace("public/", "");
          console.log(
            `Esta es la ad decodificada de la base de datos ${adWithoutPublic}`
          );
          io.emit("playAd", adWithoutPublic);
        })
        .catch((error) => {
          console.error("Error al obtener el anuncio", error);
        });
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      delete clients[socket.id];
    });
  });
};
