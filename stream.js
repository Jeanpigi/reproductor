const express = require("express");
const compression = require("express-compression");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const path = require("path");

const PORT = 3006;

const musicFolder = path.join(__dirname, "public", "music");
const adsFolder = path.join(__dirname, "public", "audios");
const adInterval = 120000; // Intervalo de 2 minutos en milisegundos

let musicFiles = [];
let currentSongIndex = 0;

let adsFiles = [];
let currentAdsIndex = 0;

app.use(express.static("public"));
app.use(compression());

function loadMusicFiles() {
  fs.readdir(musicFolder, (err, files) => {
    if (err) {
      console.error("Error al leer la carpeta de música:", err);
      return;
    }

    musicFiles = files.map((file) => path.join(musicFolder, file));
    // Baraja la lista de archivos de música de forma aleatoria
    shuffleArray(musicFiles);
    console.log("Archivos de música cargados:", musicFiles);
  });

  fs.readdir(adsFolder, (err, files) => {
    if (err) {
      console.error("Error al leer la carpeta de anuncios:", err);
      return;
    }

    adsFiles = files.map((file) => path.join(adsFolder, file));
    shuffleArray(adsFiles);
    console.log("Archivos de anuncios cargados:", adsFiles);
  });
}

// Función para barajar un array en su lugar
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function playAd(res) {
  const currentAdFilePath = adsFiles[currentAdsIndex];
  const adAudioStream = fs.createReadStream(currentAdFilePath);

  adAudioStream.on("end", () => {
    setTimeout(playMusic, adInterval); // Llamada a la música después del intervalo
  });

  adAudioStream.pipe(res, { end: false });
}

function playMusic(res) {
  const currentFilePath = musicFiles[currentSongIndex];
  const audioStream = fs.createReadStream(currentFilePath);

  audioStream.on("end", () => {
    currentSongIndex = (currentSongIndex + 1) % musicFiles.length;
    playAd(res); // Reproducir anuncio después de cada canción
  });

  audioStream.pipe(res);
}

app.get("/stream", (req, res) => {
  if (musicFiles.length === 0 || adsFiles.length === 0) {
    res.status(500).send("No hay archivos de música o anuncios disponibles.");
    return;
  }

  playMusic(res); // Comienza a reproducir música y anuncios
});

loadMusicFiles();

http.listen(PORT, () => {
  console.log(`Servidor de streaming iniciado en el puerto ${PORT}`);
});
