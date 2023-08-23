const socketIO = require("socket.io");
const fs = require("fs").promises;
const path = require("path");

module.exports = function (server, baseDir) {
  const io = socketIO(server);

  // Almacenar las conexiones de clientes
  const clients = {};

  // Manejar eventos de conexión de los clientes
  io.on("connection", (socket) => {
    console.log("Cliente conectado");

    // Agregar el cliente a la lista de conexiones
    clients[socket.id] = socket;

    // Obtener el número de clientes conectados
    const numClients = Object.keys(clients).length;

    console.log(`Número de clientes conectados: ${numClients}`);

    // Obtiene las canciones desde la carpeta music en public
    const getSongs = async () => {
      const carpetaMusica = path.join(baseDir, "public", "music");
      try {
        const archivos = await fs.readdir(carpetaMusica);
        const rutasRelativas = archivos.map((archivo) =>
          path.relative(
            path.join(baseDir, "public"),
            path.join(carpetaMusica, archivo)
          )
        );
        return rutasRelativas;
      } catch (err) {
        console.log("Error al leer la carpeta de música:", err);
        return [];
      }
    };

    const getAds = async () => {
      const carpetaAudios = path.join(baseDir, "public", "audios");
      try {
        const archivos = await fs.readdir(carpetaAudios);
        const rutasRelativas = archivos.map((archivo) =>
          path.relative(
            path.join(baseDir, "public"),
            path.join(carpetaAudios, archivo)
          )
        );
        return rutasRelativas;
      } catch (err) {
        console.log("Error al leer la carpeta de audios:", err);
        return [];
      }
    };

    // selecciona una canción aleatoriamente del array que se pase
    const obtenerAudioAleatoria = (array) => {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex]; // Devuelve un elemento aleatorio del arreglo
    };

    socket.on("play", () => {
      getSongs()
        .then((songs) => {
          const randomSong = obtenerAudioAleatoria(songs);

          io.emit("play", randomSong);
        })
        .catch((error) => {
          console.error("Error al obtener las canciones:", error);
        });
    });

    socket.on("pause", () => {
      io.emit("pause");
    });

    socket.on("ads", () => {
      getAds()
        .then((ads) => {
          const randomAds = obtenerAudioAleatoria(ads);

          io.emit("playAd", randomAds);
        })
        .catch((error) => {
          console.error("Error al obtener el anuncio", error);
        });
    });

    // Manejar eventos de desconexión de los clientes
    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      // Eliminar al cliente de la lista de conexiones
      delete clients[socket.id];
    });
  });
};
