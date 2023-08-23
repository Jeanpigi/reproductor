// En el cliente
const playButton = document.getElementById("play-button");
const play = document.getElementById("play-btn");
const audioPlayer = document.getElementById("audio-player");
const playerImage = document.getElementById("player-image");
const titulo = document.getElementById("titulo");
// const range = document.getElementById("duration__range");
// const forwardButton = document.getElementById("forward");
// const backwardButton = document.getElementById("backward");
const volumeRange = document.getElementById("volume__range");

const socket = io();

let isRotating = false;

let pausedTime = 0;

// Declaración de la variable animationId
let animationId;

// Variable para controlar si el rango está siendo arrastrado
let isDragging = false;

// Variable para rastrear el estado de reproducción
let isPlaying = false;

// range.disabled = true;

// Duración del anuncio en segundos (2 minutos)
const adDuration = 120;

playButton.addEventListener("click", () => {
  if (audioPlayer.paused) {
    if (isPlaying) {
      playSong();
    } else {
      socket.emit("play");
      isPlaying = true;
    }
  } else {
    pauseSong();
    socket.emit("pause");
  }
});

socket.on("play", (cancion) => {
  console.log("Reproduciendo cancion:", cancion);
  audioPlayer.src = cancion;
  playSong(cancion);
  changeSongtitle(cancion);

  audioPlayer.addEventListener("ended", () => {
    if (audioPlayer.currentTime >= audioPlayer.duration - adDuration) {
      audioPlayer.src = "";
      socket.emit("ads");
    } else {
      nextSong();
    }
  });
});

socket.on("playAd", (ad) => {
  console.log("Reproduciendo anuncio:", ad);
  audioPlayer.src = ad;
  playSong(ad);
  audioPlayer.addEventListener("ended", () => {
    audioPlayer.src = "";
    nextSong();
  });
});

const rotateImage = () => {
  playerImage.style.transform += "rotate(1deg)";
  animationId = requestAnimationFrame(rotateImage);
};

const stopRotation = () => {
  cancelAnimationFrame(animationId);
};

const updateControls = () => {
  if (audioPlayer.paused) {
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    playButton.classList.remove("orange");
  } else {
    play.classList.add("fa-pause");
    play.classList.remove("fa-play");
    playButton.classList.add("orange");
  }
};

const changeSongtitle = (cancion) => {
  const nombreArchivo = cancion.split("/").pop(); // Obtiene el último segmento de la ruta
  titulo.innerText = nombreArchivo;
};

// const updateProgress = () => {
//   const { duration, currentTime } = audioPlayer;

//   // Verificar si duration y currentTime son números finitos
//   if (
//     Number.isFinite(duration) &&
//     Number.isFinite(currentTime) &&
//     duration !== 0
//   ) {
//     const percent = (currentTime / duration) * 100;
//     range.value = percent;
//     range.style.setProperty("--progress", percent);
//     document.querySelector(".start").textContent = formatTime(currentTime);
//     document.querySelector(".end").textContent = formatTime(duration);
//   }
// };

// const setProgress = (event) => {
//   const totalWidth = range.offsetWidth;
//   const progressWidth = event.offsetX;
//   const current = (progressWidth / totalWidth) * audioPlayer.duration;
//   audioPlayer.currentTime = current;
// };

const playSong = (cancion) => {
  console.log(cancion);
  if (cancion !== null) {
    if (pausedTime > 0) {
      audioPlayer.currentTime = pausedTime; // Establece la posición de tiempo guardada
      pausedTime = 0; // Resetea la posición de tiempo guardada
    }
    audioPlayer.play();
    updateControls();
    if (!isRotating) {
      rotateImage();
      isRotating = true;
    }
  }
};

const pauseSong = () => {
  audioPlayer.pause();
  pausedTime = audioPlayer.currentTime; // Guarda la posición de tiempo actual
  updateControls();
  stopRotation();
  isRotating = false;
};

const nextSong = () => {
  isPlaying = false;
  socket.emit("play");
};

// const formatTime = (time) => {
//   const minutes = Math.floor(time / 60);
//   const seconds = Math.floor(time % 60);
//   return padTime(minutes) + ":" + padTime(seconds);
// };

// const padTime = (time) => {
//   if (typeof time !== "number") {
//     return time; // Si el tiempo no es un número, devuelve el valor sin modificar
//   }
//   return time < 10 ? "0" + time : time;
// };

// Agregar evento al botón de adelantar
// forwardButton.addEventListener("click", () => {
//   nextSong();
// });

// backwardButton.addEventListener("click", () => {
//   backwardSong();
// });

// // Agrega el event listener 'input' para actualizar el progreso y el color de la pista
// range.addEventListener("input", updateProgress);

// // Agrega el event listener 'mousedown' para indicar que el rango está siendo arrastrado
// range.addEventListener("mousedown", () => {
//   isDragging = true;
// });

// // Agrega el event listener 'mouseup' para indicar que se ha dejado de arrastrar el rango
// range.addEventListener("mouseup", () => {
//   isDragging = false;
// });

// // Agrega el event listener 'click' para cambiar la posición de reproducción solo si no se está arrastrando el rango
// range.addEventListener("click", (event) => {
//   if (!isDragging) {
//     setProgress(event);
//   }
// });

// Agrega un evento para detectar cambios en el control de volumen
volumeRange.addEventListener("input", () => {
  // Obtiene el valor del control de volumen (entre 0 y 1)
  const volumeValue = parseFloat(volumeRange.value);

  // Establece el volumen del reproductor de audio
  audioPlayer.volume = volumeValue;
});
