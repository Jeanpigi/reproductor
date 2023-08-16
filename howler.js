const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { Howl } = require("howler");
const fs = require("fs");
const path = require("path");

const musicFolder = path.join(__dirname, "public", "music");
const adsFolder = path.join(__dirname, "public", "audios");
const adInterval = 120000; // Intervalo de tiempo entre anuncios en milisegundos (2 minutos)

let musicPlaylist = [];
let currentSongIndex = 0;

let adPlaylist = [];
let currentAdIndex = 0;

app.use(express.static("public"));

app.get("/stream", (req, res) => {
  if (shouldPlayAd()) {
    const adFilePath = path.join(adsFolder, adPlaylist[currentAdIndex]);

    const adSound = new Howl({
      src: [adFilePath],
      html5: true,
    });

    const adStream = fs.createReadStream(adFilePath);

    adStream.on("data", (data) => {
      res.write(data);
    });

    req.on("close", () => {
      adSound.stop();
      adStream.destroy();
    });

    adSound.once("load", function () {
      adSound.play();
    });

    adSound.on("end", function () {
      console.log("Anuncio terminado");
    });
  } else {
    const musicFilePath = path.join(
      musicFolder,
      musicPlaylist[currentSongIndex]
    );

    const musicSound = new Howl({
      src: [musicFilePath],
      html5: true,
    });

    const musicStream = fs.createReadStream(musicFilePath);

    musicStream.on("data", (data) => {
      res.write(data);
    });

    req.on("close", () => {
      musicSound.stop();
      musicStream.destroy();
    });

    musicSound.once("load", function () {
      musicSound.play();
    });

    musicSound.on("end", function () {
      console.log("Canción terminada");
    });
  }
});

function loadPlaylists() {
  musicPlaylist = fs.readdirSync(musicFolder);
  musicPlaylist.sort();

  // Baraja la lista de canciones
  musicPlaylist = shuffleArray(musicPlaylist);

  adPlaylist = fs.readdirSync(adsFolder);
  adPlaylist.sort();

  playNextSong();
}

function playNextSong() {
  currentSongIndex = Math.floor(Math.random() * musicPlaylist.length);

  if (currentSongIndex >= musicPlaylist.length) {
    currentSongIndex = 0;
  }

  const musicFilePath = path.join(musicFolder, musicPlaylist[currentSongIndex]);
  console.log("Índice actual:", currentSongIndex);
  console.log("Archivo de música:", musicFilePath);

  const sound = new Howl({
    src: [musicFilePath],
    html5: true,
    onend: () => {
      playNextSong();
    },
  });

  sound.once("load", function () {
    sound.play();
  });

  sound.on("end", function () {
    console.log("Canción terminada");
  });

  io.emit("song", musicPlaylist[currentSongIndex]);

  setTimeout(() => {
    playNextAd();
  }, adInterval);
}

function playNextAd() {
  currentAdIndex++;

  if (currentAdIndex >= adPlaylist.length) {
    currentAdIndex = 0;
  }

  playNextSong();
}

function shouldPlayAd() {
  return currentSongIndex !== 0 && currentSongIndex % 2 === 0;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

http.listen(8080, () => {
  console.log(`Servidor de streaming iniciado en el puerto 8080`);
  loadPlaylists();
});
