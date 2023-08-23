const express = require("express");
const compression = require("compression");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const socketIOClient = require("socket.io-client");

const PORT = 3006;

const musicFolder = path.join(__dirname, "public", "music");
let currentFilePath = null; // Almacena la ruta completa del archivo de música actual

// Establece la conexión con el servidor en localhost:3005
const socket = socketIOClient("http://localhost:3005");

app.use(express.static("public"));
app.use(compression());

// Escucha el evento playMusic emitido desde localhost:3005
socket.on("playMusic", (songIndex) => {
  currentFilePath = path.join(musicFolder, songIndex);
});

app.get("/stream", (req, res) => {
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
  });
});

http.listen(PORT, () => {
  console.log(`Servidor de streaming iniciado en el puerto ${PORT}`);
});
