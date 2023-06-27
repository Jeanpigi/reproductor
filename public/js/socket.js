document.addEventListener('DOMContentLoaded', function () {
    // Conectarse al servidor Socket.io
    var socket = io();

    // Escuchar el evento 'playMusic' desde el servidor
    socket.on('playMusic', function (songIndex) {
        // Obtener el elemento de audio
        var audioPlayer = document.getElementById('audio-player');

        // Establecer la URL de la pista que está sonando
        var musicUrl = `http://localhost:3002/stream/${songIndex}`;
        audioPlayer.src = musicUrl;

        // Reproducir la pista
        audioPlayer.play();
    });
});