const express = require("express");
const compression = require("compression");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const fs = require("fs");
const { Howl } = require("howler");

const io = require("socket.io-client");

const SERVER_URL = "http://localhost:3005"; // Cambia esto a la URL de tu primer servidor

const socket = io(SERVER_URL);

const PORT = 3006;

app.use(express.static("public"));
app.use(compression());

let musicSound; // Declaración de la instancia de Howl para la música

app.get("/stream", (req, res) => {
  // Si no tienes una lógica aquí para obtener el archivo actual (currentFilePath), asegúrate de tenerla

  // Escucha el evento "play" desde el servidor de sockets
  socket.on("play", (cancion) => {
    console.log(cancion);
    let songPath = path.join(__dirname, "public", "music", cancion);

    console.log(songPath);

    // Detener la reproducción del audio anterior si existe
    if (musicSound) {
      musicSound.unload();
    }

    // Crear una nueva instancia de Howl para reproducir la canción
    musicSound = new Howl({
      src: songPath,
      html5: true,
      onend: () => {
        console.log("Canción terminada");
      },
    });

    // Empezar a transmitir el audio al cliente
    musicSound.play();

    // Cuando la solicitud se cierre, detener la reproducción
    req.on("close", () => {
      musicSound.stop();
    });
  });

  // Puedes responder con algún mensaje al cliente que hizo la solicitud
  res.send("Reproducción iniciada.");
});

http.listen(PORT, () => {
  console.log(`Servidor de streaming iniciado en el puerto ${PORT}`);
});
