const socketIO = require("socket.io");
const fs = require("fs");
const path = require("path");

module.exports = function (server) {
  const io = socketIO(server);
  const clients = {};

  io.on("connection", (socket) => {
    console.log("Cliente conectado");

    clients[socket.id] = socket;
    const numClients = Object.keys(clients).length;
    console.log(`Número de clientes conectados: ${numClients}`);
    sendSongsToClient(socket);
    sendAdsToClient(socket);

    socket.on("sync", (currentTime) => {
      Object.values(clients).forEach((client) => {
        if (client !== socket) {
          client.emit("sync", currentTime);
        }
      });
    });

    const broadcastEvent = (eventName, data) => {
      socket.broadcast.emit(eventName, data);
    };

    socket.on("playMusic", broadcastEvent.bind(null, "playMusic"));
    socket.on("pauseMusic", broadcastEvent.bind(null, "pauseMusic"));
    socket.on("resumeStream", broadcastEvent.bind(null, "resumeStream"));
    socket.on("playAd", broadcastEvent.bind(null, "playAd"));

    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      delete clients[socket.id];
    });
  });
};

const sendSongsToClient = (socket) => {
  const carpetaMusica = "public/music";
  const archivos = fs.readdirSync(carpetaMusica);

  const canciones = archivos.filter((archivo) => {
    const extension = archivo.split(".").pop();
    return extension === "mp3" || extension === "m4a";
  });

  canciones.forEach((cancion) => {
    const { name: nombreCancion, ext: extension } = path.parse(cancion);
    socket.emit("canciones", { nombreCancion, extension });
  });
};

const sendAdsToClient = (socket) => {
  const carpetaAnuncios = "public/audios";
  const archivos = fs.readdirSync(carpetaAnuncios);

  const anuncios = archivos.filter((archivo) => {
    const extension = archivo.split(".").pop();
    return extension === "mp3";
  });

  anuncios.forEach((cancion) => {
    const nombreAnuncio = path.parse(cancion).name;
    const extension = path.parse(cancion).ext;

    socket.emit("anuncios", { nombreAnuncio, extension });
  });
};
