const socketIO = require("socket.io");
const fs = require("fs").promises;

module.exports = function (server) {
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

    // Iniciar el ciclo de reproducción
    startPlayback(socket);

    // Manejar eventos de desconexión de los clientes
    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      // Eliminar al cliente de la lista de conexiones
      delete clients[socket.id];
    });
  });
};

// Obtiene las canciones desde la carpeta music en public
const getSongs = async () => {
  const carpetaMusica = "public/music";
  try {
    const archivos = await fs.readdir(carpetaMusica); // Lee los archivos de forma asincrónica
    return archivos; // Devuelve el arreglo de nombres de archivos
  } catch (err) {
    console.log("Error al leer la carpeta de música:", err);
    return [];
  }
};

// selecciona una canción aleatoriamente del array que se pase
const obtenerCancionAleatoria = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex]; // Devuelve un elemento aleatorio del arreglo
};

// Función para iniciar el ciclo de reproducción
const startPlayback = async (socket) => {
  try {
    const songs = await getSongs();
    if (songs.length > 0) {
      // Reproduce canciones en bucle
      while (true) {
        const randomSong = obtenerCancionAleatoria(songs);
        socket.broadcast.emit("play", randomSong);
        await delay(5000); // Espera 5 segundos antes de reproducir la siguiente canción
      }
    }
  } catch (error) {
    console.error("Error al obtener o reproducir canciones:", error);
  }
};

// Función de espera asincrónica
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
