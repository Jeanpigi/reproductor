const express = require("express");
const compression = require("compression");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const PORT = 3006;

const musicFolder = path.join(__dirname, "public", "music");
const adsFolder = path.join(__dirname, "public", "audios");
const adInterval = 1200000; // Intervalo de 2 minutos en milisegundos

let musicFiles = [];
let adsFiles = [];
let currentFileIndex = 0; // Índice para alternar entre canciones y anuncios

app.use(express.static("public"));
app.use(compression());

function loadFiles(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files.map((file) => path.join(folderPath, file)));
    });
  });
}

async function initialize() {
  try {
    musicFiles = await loadFiles(musicFolder);
    adsFiles = await loadFiles(adsFolder);
    shuffleArray(musicFiles);
    shuffleArray(adsFiles);
  } catch (error) {
    console.error("Error al cargar los archivos:", error);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

app.get("/stream", (req, res) => {
  const currentFilePath = getNextItemPath();

  if (!currentFilePath) {
    res.status(500).send("No hay archivos disponibles para reproducir.");
    return;
  }

  ffmpeg.ffprobe(currentFilePath, (err, metadata) => {
    if (err) {
      console.error("Error al obtener la información del archivo:", err);
      return;
    }

    const bitRate = metadata.streams[0].bit_rate;
    const durationInSeconds = metadata.format.duration;
    const sampleRate = metadata.streams[0].sample_rate; // Obtén la frecuencia de muestreo
    const audioCodec = metadata.streams[0].codec_name; // Obtén el códec de audio
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const fileName = path.basename(currentFilePath); // Extrae el nombre del archivo de la ruta completa

    console.log("----------------------------------------------");
    console.log(`Archivo: ${fileName}`);
    console.log(`Duración: ${minutes}:${seconds}`);
    console.log(`Duración en segundos: ${durationInSeconds}`);
    console.log(`Frecuencia de muestreo: ${sampleRate} Hz`);
    console.log(`Códec de audio: ${audioCodec}`);
    console.log(`Tasa de bits: ${bitRate} bps`);
    console.log("----------------------------------------------");

    const audioStream = fs.createReadStream(currentFilePath);

    res.setHeader("Content-Type", "audio/mpeg");
    res.set("transfer-encoding", "chunked");
    audioStream.pipe(res);

    audioStream.on("end", () => {
      setTimeout(() => {
        res.end(); // Finaliza la transmisión
      }, adInterval);
    });
  });
});

function getNextItemPath() {
  const currentFilePath =
    currentFileIndex % 2 === 0 ? musicFiles.shift() : adsFiles.shift();

  if (currentFileIndex % 2 === 0) {
    if (musicFiles.length === 0) {
      shuffleArray(musicFiles);
    }
  } else {
    if (adsFiles.length === 0) {
      shuffleArray(adsFiles);
    }
  }

  // Verifica si se han agotado tanto las canciones como los anuncios
  if (musicFiles.length === 0 && adsFiles.length === 0) {
    // Reinicia los archivos y el índice
    initialize();
    currentFileIndex = 0;
  } else {
    currentFileIndex++;
  }

  return currentFilePath;
}

initialize();

http.listen(PORT, () => {
  console.log(`Servidor de streaming iniciado en el puerto ${PORT}`);
});
