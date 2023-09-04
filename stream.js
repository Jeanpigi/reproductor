const express = require("express");
const compression = require("compression");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const io = require("socket.io-client");

const SERVER_URL = "http://localhost:3005";

const socket = io(SERVER_URL);

const PORT = 3006;

const musicFolder = path.join(__dirname, "public", "music");
const anunciosFolder = path.join(__dirname, "public", "audios");

let currentSong = "";
let currentAd = "";

app.use(express.static("public"));
app.use(compression());

app.get("/stream", (req, res) => {
  let filePath;
  const clientIP = req.ip;
  if (!currentSong) {
    res.status(500).send("No hay canción para reproducir.");
    return;
  }

  if (currentAd) {
    filePath = path.join(anunciosFolder, currentAd);
    currentAd = "";
  } else if (currentSong) {
    filePath = path.join(musicFolder, currentSong);
  } else {
    res.status(500).send("No hay canción ni anuncio para reproducir.");
    return;
  }

  ffmpeg.ffprobe(filePath, (err, metadata) => {
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

    const fileName = path.basename(filePath); // Extrae el nombre del archivo de la ruta completa

    console.log("----------------------------------------------");
    console.log(`Ip: ${clientIP}`);
    console.log(`Archivo: ${fileName}`);
    console.log(`Duración: ${minutes}:${seconds}`);
    console.log(`Duración en segundos: ${durationInSeconds}`);
    console.log(`Frecuencia de muestreo: ${sampleRate} Hz`);
    console.log(`Códec de audio: ${audioCodec}`);
    console.log(`Tasa de bits: ${bitRate} bps`);
    console.log("----------------------------------------------");

    const audioStream = fs.createReadStream(filePath);

    res.setHeader("Content-Type", "audio/mpeg");
    res.set("transfer-encoding", "chunked");
    audioStream.pipe(res);
  });
});

// Manejo de eventos Socket.IO
const handlePlayEvent = (cancion) => {
  const nombreArchivo = cancion.split("/").pop();
  currentSong = nombreArchivo;
};

const handlePlayAdEvent = (anuncio) => {
  currentSong = "";
  const nombreAnuncio = anuncio.split("/").pop();
  currentAd = nombreAnuncio;
};

const handleDisconnectEvent = () => {
  console.log("Se ha perdido la conexión con el servidor");
  socket.connect();
};

socket.on("play", handlePlayEvent);
socket.on("playAd", handlePlayAdEvent);
socket.on("disconnect", handleDisconnectEvent);

http.listen(PORT, () => {
  console.log(`Servidor de streaming iniciado en el puerto ${PORT}`);
});
