const socketIO = require("socket.io");
const cron = require("node-cron");
const moment = require("moment-timezone");
const {
  getCachedSongs,
  getCachedAds,
  getCachedDecemberSongs,
} = require("./getCached");

const { getLocalSongs, getLocalAds } = require("./localFile");

const {
  obtenerAnuncioAleatorioConPrioridad,
  obtenerAudioAleatoriaSinRepetirDeciembre,
  obtenerAudioAleatoriaSinRepetir,
} = require("./getAudio");

module.exports = (server) => {
  const io = socketIO(server, {
    reconnection: true,
    reconnectionAttempts: 5, // Máximo número de intentos de reconexión
    reconnectionDelay: 2000, // Tiempo inicial para reconectar
    reconnectionDelayMax: 5000, // Tiempo máximo entre intentos de reconexión
    randomizationFactor: 0.5,
  });

  const clients = {};

  const recentlyPlayedSongs = [];
  const recentlyPlayedDecember = [];
  const recentlyPlayedAds = [];

  let decemberSongCount = 0;
  const DECEMBER_SONG_LIMIT = 4; // Cambia este número para ajustar la cantidad de canciones de diciembre

  // Define las horas en las que deseas reproducir el himno (por ejemplo, a las 6:00 AM,12:00 AM, 12:00 PM y 6:00 PM)
  const horasHimno = ["0 6 * * *", "0 12 * * *", "0 18 * * *", "0 0 * * *"];

  io.on("connection", (socket) => {
    console.log("Cliente conectado");

    clients[socket.id] = socket;
    const numClients = Object.keys(clients).length;
    console.log(`Número de clientes conectados: ${numClients}`);

    // Suponiendo que tienes una función que se activa cuando la pista cambia
    const onTrackChange = (newTrack) => {
      io.emit("trackChange", { track: newTrack });
    };

    // Función para reproducir el himno
    const reproducirHimno = () => {
      const himnoPath = "himno/HimnoNacional.mp3";
      console.log(himnoPath);
      io.emit("himno", himnoPath);
      onTrackChange(himnoPath);
    };

    // Programa las tareas cron para reproducir el himno en las horas especificadas
    for (const hora of horasHimno) {
      cron.schedule(hora, () => {
        reproducirHimno();
      });
    }

    socket.on("play", async () => {
      try {
        const currentMonth = moment().tz("America/Bogota").format("M");
        let songPath;

        if (currentMonth === "12") {
          // Si es diciembre
          if (decemberSongCount < DECEMBER_SONG_LIMIT) {
            const decemberSongs = await getCachedDecemberSongs(); // Usando versión en caché
            const decemberSong = obtenerAudioAleatoriaSinRepetirDeciembre(
              decemberSongs,
              recentlyPlayedDecember
            );
            songPath = decemberSong
              ? decodeURIComponent(decemberSong).replace("public/", "")
              : null;
            decemberSongCount++;
            console.log(recentlyPlayedDecember);
          } else {
            const songs = await getCachedSongs();
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
          const songs = await getCachedSongs();
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
          onTrackChange(songPath);
        } else {
          console.error("La ruta de la canción es inválida o undefined");
        }
      } catch (error) {
        console.error("Error al obtener la canción", error);
        // Asume que tienes una función getLocalSongs que podría beneficiarse de la caché también
        getLocalSongs() // Asume esta función también está implementada con caché
          .then((songs) => {
            const randomSong = obtenerAudioAleatoriaSinRepetir(
              songs,
              recentlyPlayedSongs
            );
            io.emit(
              "play",
              decodeURIComponent(randomSong.filepath).replace("public/", "")
            );
            onTrackChange(randomSong.filepath);
          })
          .catch((error) => {
            console.error("Error al obtener las canciones locales:", error);
          });
      }
    });

    socket.on("pause", () => {
      io.emit("pause");
    });

    socket.on("ads", async () => {
      try {
        const ads = await getCachedAds();
        const randomAd = obtenerAnuncioAleatorioConPrioridad(
          ads,
          recentlyPlayedAds
        );
        const decodedPath = decodeURIComponent(randomAd.filepath);
        const adWithoutPublic = decodedPath.replace("public/", "");
        io.emit("playAd", adWithoutPublic);
        onTrackChange(adWithoutPublic);
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
            onTrackChange(randomAd);
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
