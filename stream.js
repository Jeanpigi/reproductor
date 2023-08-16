const express = require("express");
const compression = require("express-compression");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const path = require("path");

const PORT = 3006;

const musicFolder = path.join(__dirname, "public", "music");
const adsFolder = path.join(__dirname, "public", "audios");
const adInterval = 120000;

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
}

// Función para barajar un array en su lugar
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

app.get("/stream", (req, res) => {
  if (musicFiles.length === 0) {
    res.status(500).send("No hay archivos de música disponibles.");
    return;
  }

  const currentFilePath = musicFiles[currentSongIndex];
  const audioStream = fs.createReadStream(currentFilePath);

  res.setHeader("Content-Type", "audio/mpeg");
  audioStream.pipe(res);

  audioStream.on("end", () => {
    currentSongIndex = (currentSongIndex + 1) % musicFiles.length;
  });
});

loadMusicFiles();

http.listen(PORT, () => {
  console.log(`Servidor de streaming iniciado en el puerto ${PORT}`);
});
