const express = require("express");
const app = express();
const path = require("path");
const compression = require("compression");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const io = require("socket.io-client");

const SERVER_URL = "http://localhost:3005";

const socket = io(SERVER_URL);

// Define the port to run the server on
const PORT = 3007;

const publicFolder = path.join(__dirname, "public");

// Serve static files from a specific directory
app.use(express.static("public"));
app.use(compression());

let currentSong = "";

// Handle root request
app.get("/stream", (req, res) => {
  const clientIP = req.ip;

  filePath = path.join(publicFolder, currentSong);

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

socket.on("trackChange", (data) => {
  const { track } = data;
  console.log(track);

  currentSong = track;
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
