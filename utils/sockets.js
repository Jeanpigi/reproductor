const socketIO = require("socket.io");
const cron = require("node-cron");
const fs = require("fs").promises;
const path = require("path");
const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");
const moment = require("moment-timezone");

module.exports = (server, baseDir) => {
  const io = socketIO(server, {
    reconnection: true,
    reconnectionDelay: 2000,
  });

  const clients = {};

  const recentlyPlayedSongs = [];
  const recentlyPlayedDecember = [];
  const recentlyPlayedAds = [];

  let MAX_RECENT_ITEMS = 0;
  let MAX_RECENT_ITEMS_ADS = 0;

  let decemberSongCount = 0;
  const DECEMBER_SONG_LIMIT = 4; // Cambia este número para ajustar la cantidad de canciones de diciembre

  // Define las horas en las que deseas reproducir el himno (por ejemplo, a las 6:00 AM,12:00 AM, 12:00 PM y 6:00 PM)
  const horasHimno = ["0 6 * * *", "0 12 * * *", "0 18 * * *", "0 0 * * *"];

  const basePublicDir = path.join(baseDir, "public");

  io.on("connection", (socket) => {
    console.log("Cliente conectado");

    clients[socket.id] = socket;
    const numClients = Object.keys(clients).length;
    console.log(`Número de clientes conectados: ${numClients}`);

    const obtenerDiaActualEnColombia = () => {
      return moment().tz("America/Bogota").locale("es").format("ddd");
    };

    const getLocalSongs = async () => {
      const carpetaMusica = path.join(basePublicDir, "music");
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

    const getLocalAds = async () => {
      const carpetaAnuncios = path.join(basePublicDir, "audios");
      try {
        const archivos = await fs.readdir(carpetaAnuncios);
        return archivos.map((archivo) =>
          path.relative(
            path.join(baseDir, "public"),
            path.join(carpetaAnuncios, archivo)
          )
        );
      } catch (err) {
        console.log("Error al leer la carpeta de anuncios:", err);
        return [];
      }
    };

    const getDecemberSongs = async () => {
      const decemberMusicFolder = path.join(basePublicDir, "diciembre");
      try {
        const files = await fs.readdir(decemberMusicFolder);
        return files.map((file) =>
          path.relative(
            path.join(baseDir, "public"),
            path.join(decemberMusicFolder, file)
          )
        );
      } catch (err) {
        console.log("Error al leer la carpeta de música de diciembre:", err);
        return [];
      }
    };

    const getNumberMusic = async () => {
      const songs = await getLocalSongs();
      return (MAX_RECENT_ITEMS = songs.length);
    };

    const getNumberAds = async () => {
      const ads = await getLocalAds();
      return (MAX_RECENT_ITEMS_ADS = ads.length);
    };

    getNumberMusic();
    getNumberAds();

    const obtenerAudioAleatoria = (array) => {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    };

    const obtenerAudioAleatoriaSinRepetir = (array, recentlyPlayed) => {
      const availableOptions = array.filter((item) => {
        const fileName = item.filename;
        // Compara el nombre del archivo con los nombres de archivos reproducidos recientemente
        return !recentlyPlayed.some(
          (playedItem) => playedItem.filename === fileName
        );
      });

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

      console.log(
        "-----------------------------------------------------------"
      );
      console.log("count of recently songs played:", recentlyPlayed.length);
      console.log(
        "-----------------------------------------------------------"
      );

      return randomItem;
    };

    const obtenerAnuncioAleatorioConPrioridad = (array, recentlyPlayedAds) => {
      const diaActual = obtenerDiaActualEnColombia();
      let opcionesPrioridad = array.filter(
        (item) => item.dia === diaActual || item.dia === "T"
      );

      // Asegurarse de que opcionesPrioridad sea un arreglo
      if (!Array.isArray(opcionesPrioridad)) {
        opcionesPrioridad = [opcionesPrioridad];
      }

      // Filtra las opciones disponibles que no se han reproducido recientemente
      const opcionesDisponibles = opcionesPrioridad.filter((item) => {
        const fileName = item.filename;
        // Compara el nombre del archivo con los nombres de archivos reproducidos recientemente
        return !recentlyPlayedAds.some(
          (playedItem) => playedItem.filename === fileName
        );
      });

      if (opcionesDisponibles.length === 0) {
        // Si no hay opciones disponibles que no se hayan reproducido recientemente, reiniciar el registro
        recentlyPlayedAds.length = 0;
        return obtenerAnuncioAleatorioConPrioridad(array, recentlyPlayedAds);
      }

      const randomItem = obtenerAudioAleatoria(opcionesDisponibles);
      recentlyPlayedAds.push(randomItem);

      if (recentlyPlayedAds.length > MAX_RECENT_ITEMS_ADS) {
        recentlyPlayedAds.shift();
      }

      console.log(
        "-----------------------------------------------------------"
      );
      console.log("Recently Played Ads:", recentlyPlayedAds);
      console.log(
        "-----------------------------------------------------------"
      );
      console.log("count of recently Ads played:", recentlyPlayedAds.length);
      console.log(
        "-----------------------------------------------------------"
      );

      return randomItem;
    };

    // Función para reproducir el himno
    const reproducirHimno = () => {
      const himnoPath = "himno/HimnoNacional.mp3";
      console.log(himnoPath);
      io.emit("himno", himnoPath);
    };

    // Programa las tareas cron para reproducir el himno en las horas especificadas
    for (const hora of horasHimno) {
      cron.schedule(hora, () => {
        reproducirHimno();
      });
    }

    // socket.on("play", async () => {
    //   try {
    //     const songs = await getAllSongs();
    //     const randomSong = obtenerAudioAleatoriaSinRepetir(
    //       songs,
    //       recentlyPlayedSongs
    //     );
    //     const decodedPath = decodeURIComponent(randomSong.filepath);
    //     const songWithoutPublic = decodedPath.replace("public/", "");
    //     io.emit("play", songWithoutPublic);
    //   } catch (error) {
    //     console.error("Error al obtener la canción", error);
    //     // Puedes agregar aquí el manejo de errores, si es necesario
    //     getLocalSongs()
    //       .then((songs) => {
    //         const randomSong = obtenerAudioAleatoriaSinRepetir(
    //           songs,
    //           recentlyPlayedSongs
    //         );
    //         io.emit("play", randomSong);
    //       })
    //       .catch((error) => {
    //         console.error("Error al obtener las canciones:", error);
    //       });
    //   }
    // });

    socket.on("play", async () => {
      try {
        const currentMonth = moment().format("M");
        let songPath;

        if (currentMonth === "12") {
          // Si es diciembre
          if (decemberSongCount < DECEMBER_SONG_LIMIT) {
            const decemberSongs = await getDecemberSongs();
            const song = obtenerAudioAleatoriaSinRepetir(
              decemberSongs,
              recentlyPlayedDecember
            );
            songPath = song
              ? decodeURIComponent(song).replace("public/", "")
              : null;
            decemberSongCount++;
          } else {
            const songs = await getAllSongs();
            const randomSong = obtenerAudioAleatoriaSinRepetir(
              songs,
              recentlyPlayedSongs
            );
            songPath = randomSong
              ? decodeURIComponent(randomSong.filepath).replace("public/", "")
              : null;
            decemberSongCount = 0; // Resetear el contador para volver a las canciones de diciembre
          }
        } else {
          const songs = await getAllSongs();
          const randomSong = obtenerAudioAleatoriaSinRepetir(
            songs,
            recentlyPlayedSongs
          );
          songPath = randomSong
            ? decodeURIComponent(randomSong.filepath).replace("public/", "")
            : null;
        }

        if (songPath) {
          console.log("Ruta de la canción:", songPath);
          io.emit("play", songPath);
        } else {
          console.error("La ruta de la canción es inválida o undefined");
        }
      } catch (error) {
        console.error("Error al obtener la canción", error);
        getLocalSongs()
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
      }
    });

    socket.on("pause", () => {
      io.emit("pause");
    });

    socket.on("ads", async () => {
      try {
        const ads = await getAllAds();
        const randomAd = obtenerAnuncioAleatorioConPrioridad(
          ads,
          recentlyPlayedAds
        );
        const decodedPath = decodeURIComponent(randomAd.filepath);
        const adWithoutPublic = decodedPath.replace("public/", "");
        io.emit("playAd", adWithoutPublic);
      } catch (error) {
        console.error("Error al obtener el anuncio", error);

        // Manejar el error aquí y luego llamar a getLocalAds
        getLocalAds()
          .then((ads) => {
            const randomAd = obtenerAnuncioAleatorioConPrioridad(
              ads,
              recentlyPlayedAds
            );
            io.emit("playAd", randomAd);
          })
          .catch((error) => {
            console.error("Error al obtener los anuncios:", error);
            io.emit("playAd", "");
          });
      }
    });

    socket.on("disconnect", () => {
      delete clients[socket.id];
    });
  });
};
