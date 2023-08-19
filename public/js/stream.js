// En el cliente
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const socket = io();

playButton.addEventListener("click", () => {
  socket.emit("requestPlay"); // Envía una solicitud al servidor para reproducir
});

pauseButton.addEventListener("click", () => {
  socket.emit("requestPause"); // Envía una solicitud al servidor para pausar
});

// Escucha eventos de sincronización del servidor
socket.on("sync", ({ isPlaying, currentTime }) => {
  // Actualiza la interfaz gráfica según el estado actual
  if (isPlaying) {
    // Mostrar que se está reproduciendo
  } else {
    // Mostrar que está pausado
  }
  // Actualiza el tiempo de reproducción en la interfaz
});
