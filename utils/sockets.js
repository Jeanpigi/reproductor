const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

module.exports = function(server) {
  const io = socketIO(server);

  // Manejar eventos de conexión de los clientes
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    sendSongsToClient(socket);
    sendAdsToClient(socket);
  
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
    
    // Resto del código del socket
  
    // Manejar eventos de desconexión de los clientes
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
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
      const rutaCancion = path.join(carpetaMusica, cancion);

      // crear un stream de lectura del archivo de la cancion
      const stream = fs.createReadStream(rutaCancion);
      socket.emit('canciones', {nombreCancion, extension });
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
      const rutaCancion = path.join(carpetaAnuncios, cancion);

      // crear un stream de lectura del archivo de la cancion
      const stream = fs.createReadStream(rutaCancion);
      socket.emit('anuncios', {nombreAnuncio, extension });
    });
  });
}