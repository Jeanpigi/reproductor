const WebSocket = require("ws");
const cron = require("node-cron");
const moment = require("moment-timezone");
const { getAllSongs } = require("../model/songLite");
const { getAllAds } = require("../model/adLite");
const { getDecemberSongs } = require("./localFile");
const {
  obtenerAnuncioAleatorioConPrioridad,
  obtenerAudioAleatoriaSinRepetirDeciembre,
  obtenerAudioAleatoriaSinRepetir,
} = require("./getAudio");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  const recentlyPlayedSongs = [];
  const recentlyPlayedDecember = [];
  const recentlyPlayedAds = [];

  let decemberSongCount = 0;
  const DECEMBER_SONG_LIMIT = 4; // Cambia este número para ajustar la cantidad de canciones de diciembre

  const horasHimno = ["0 6 * * *", "0 12 * * *", "0 18 * * *", "0 0 * * *"];

  const broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  const onTrackChange = (newTrack) => {
    broadcast({ event: "trackChange", track: newTrack });
  };

  const reproducirHimno = () => {
    const himnoPath = "himno/HimnoNacional.mp3";
    console.log(himnoPath);
    broadcast({ event: "himno", path: himnoPath });
    onTrackChange(himnoPath);
  };

  for (const hora of horasHimno) {
    cron.schedule(hora, () => {
      reproducirHimno();
    });
  }

  wss.on("connection", (ws) => {
    console.log("Cliente conectado");

    ws.on("message", async (message) => {
      const { event } = JSON.parse(message);

      switch (event) {
        case "play":
          try {
            const currentMonth = moment().tz("America/Bogota").format("M");
            let songPath;

            if (currentMonth === "12") {
              if (decemberSongCount < DECEMBER_SONG_LIMIT) {
                const decemberSongs = await getDecemberSongs();
                const decemberSong = obtenerAudioAleatoriaSinRepetirDeciembre(
                  decemberSongs,
                  recentlyPlayedDecember
                );
                songPath = decemberSong
                  ? decodeURIComponent(decemberSong).replace("public/", "")
                  : null;
                decemberSongCount++;
              } else {
                const songs = await getAllSongs();
                const randomSong = obtenerAudioAleatoriaSinRepetir(
                  songs,
                  recentlyPlayedSongs
                );
                songPath = randomSong
                  ? decodeURIComponent(randomSong.filepath).replace(
                      "public/",
                      ""
                    )
                  : null;
                decemberSongCount = 0;
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
              broadcast({ event: "play", path: songPath });
              onTrackChange(songPath);
            } else {
              console.error("La ruta de la canción es inválida o undefined");
            }
          } catch (error) {
            console.error("Error al obtener la canción", error);
          }
          break;

        case "pause":
          broadcast({ event: "pause" });
          break;

        case "ads":
          try {
            const ads = await getAllAds();
            const randomAd = obtenerAnuncioAleatorioConPrioridad(
              ads,
              recentlyPlayedAds
            );
            const decodedPath = decodeURIComponent(randomAd.filepath);
            const adWithoutPublic = decodedPath.replace("public/", "");
            broadcast({ event: "playAd", path: adWithoutPublic });
            onTrackChange(adWithoutPublic);
          } catch (error) {
            console.error("Error al obtener el anuncio", error);
          }
          break;
      }
    });

    ws.on("close", () => {
      console.log("Cliente desconectado");
    });
  });
};
