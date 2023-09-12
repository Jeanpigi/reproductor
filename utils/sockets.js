const socketIO = require("socket.io");
const cron = require("node-cron");
const { getAllSongs, getAllAds } = require("../database/db");
const moment = require("moment-timezone");

module.exports = (server) => {
  const io = socketIO(server, {
    reconnection: true,
    reconnectionDelay: 1000,
  });

  const clients = {};

  const recentlyPlayedSongs = [];

  const MAX_RECENT_ITEMS = 120;

  // Define las horas en las que deseas reproducir el himno (por ejemplo, a las 6:00 AM, 12:00 PM y 6:00 PM)
  const horasHimno = ["0 6 * * *", "0 12 * * *", "0 18 * * *"];

  io.on("connection", (socket) => {
    console.log("Cliente conectado");

    clients[socket.id] = socket;
    const numClients = Object.keys(clients).length;
    console.log(`Número de clientes conectados: ${numClients}`);

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

    // Función para reproducir el himno
    const reproducirHimno = () => {
      const himnoPath = "himno/HimnoNacional.m4a";
      console.log("Reproduciendo el himno...");
      io.emit("himno", himnoPath);
      // Programa las tareas cron para reproducir el himno en las horas especificadas
      horasHimno.forEach((hora) => {
        cron.schedule(hora, () => {
          reproducirHimno();
        });
      });
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
      const diaActual = obtenerDiaActualEnColombia();
      console.log(diaActual);
      await getAllAds()
        .then((ads) => {
          const randomAd = obtenerAudioAleatoriaConPrioridad(ads);
          const decodedPath = decodeURIComponent(randomAd.filepath);
          const adWithoutPublic = decodedPath.replace("public/", "");
          io.emit("playAd", adWithoutPublic);
        })
        .catch((error) => {
          console.error("Error al obtener el anuncio", error);
        });
    });

    socket.on("playHimno", async () => {
      await reproducirHimno();
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      delete clients[socket.id];
    });
  });
};
