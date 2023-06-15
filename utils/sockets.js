const socketIO = require('socket.io');

module.exports = function(server) {
  const io = socketIO(server);

  // Manejar eventos de conexión de los clientes
  io.on('connection', (socket) => {
    console.log('Cliente conectado');
  
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
