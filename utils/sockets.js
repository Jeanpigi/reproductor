const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

module.exports = function (server) {
  const io = socketIO(server);

  // Almacenar las conexiones de clientes
  const clients = {};

  // Manejar eventos de conexión de los clientes
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Agregar el cliente a la lista de conexiones
    clients[socket.id] = socket;

    // Obtener el número de clientes conectados
    const numClients = Object.keys(clients).length;

    console.log(`Número de clientes conectados: ${numClients}`);

    sendSongsToClient(socket);
    sendAdsToClient(socket);

    // Escuchar eventos de mensajes recibidos desde el cliente
    socket.on('sync', (currentTime) => {
      // Transmitir el mensaje a todos los demás clientes
      clients.forEach((client) => {
        if (client !== socket) {
          client.emit('sync', currentTime);
        }
      });
    });

    // Emitir el evento 'playMusic' cuando se reproduzca una canción en el servidor
    socket.on('playMusic', (songIndex) => {
      io.emit('playMusic', songIndex);
    });

    // Emitir el evento 'pauseMusic' cuando se pause la canción en el servidor
    socket.on('pauseMusic', () => {
      io.emit('pauseMusic');
    });

    // Emitir el evento 'playAd' cuando se reproduzca un anuncio en el servidor
    socket.on('playAd', (adIndex) => {
      io.emit('playAd', adIndex);
    });

    // Manejar eventos de desconexión de los clientes
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
      // Eliminar al cliente de la lista de conexiones
      delete clients[socket.id];
    });
  });

};

const sendSongsToClient = (socket) => {
  const carpetaMusica = 'public/music';
  fs.readdir(carpetaMusica, (err, archivos) => {
    if (err) {
      console.log('Error al leer la carpeta de musica:', err);
      return;
    }

    const canciones = archivos.filter((archivo) => {
      const extension = archivo.split('.').pop();
      return extension === 'mp3' || extension === 'm4a';
    });


    canciones.forEach((cancion) => {
      const nombreCancion = path.parse(cancion).name;
      const extension = path.parse(cancion).ext;

      socket.emit('canciones', { nombreCancion, extension });
    });
  });
}

const sendAdsToClient = (socket) => {
  const carpetaAnuncios = 'public/audios';
  fs.readdir(carpetaAnuncios, (err, archivos) => {
    if (err) {
      console.log('Error al leer la carpeta de musica:', err);
      return;
    }

    const anuncios = archivos.filter((archivo) => {
      const extension = archivo.split('.').pop();
      return extension === 'mp3';
    });


    anuncios.forEach((cancion) => {
      const nombreAnuncio = path.parse(cancion).name;
      const extension = path.parse(cancion).ext;

      socket.emit('anuncios', { nombreAnuncio, extension });
    });
  });
}