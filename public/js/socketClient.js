// En el cliente
const playButton = document.getElementById("play-button");
const play = document.getElementById("play-btn");
const audioPlayer = document.getElementById("audio-player");
const playerImage = document.getElementById("player-image");
const titulo = document.getElementById("titulo");
const range = document.getElementById("duration__range");

const socket = io();

let isRotating = false;

let animationId; // Declaración de la variable animationId

playButton.addEventListener("click", () => {
  socket.emit("play", "enviando el play"); // Envía una solicitud al servidor para reproducir
});

socket.on("play", (cancion) => {
  console.log(cancion);
  audioPlayer.src = "/music/" + cancion;
  playSong(cancion);
  changeSongtitle(cancion);
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
  titulo.innerText = cancion;
};

const updateProgress = () => {
  const { duration, currentTime } = audioPlayer;

  // Verificar si duration y currentTime son números finitos
  if (
    Number.isFinite(duration) &&
    Number.isFinite(currentTime) &&
    duration !== 0
  ) {
    const percent = (currentTime / duration) * 100;
    range.value = percent;
    range.style.setProperty("--progress", percent);
    document.querySelector(".start").textContent = formatTime(currentTime);
    document.querySelector(".end").textContent = formatTime(duration);
  }
};

const setProgress = (event) => {
  const totalWidth = range.offsetWidth;
  const progressWidth = event.offsetX;
  const current = (progressWidth / totalWidth) * audioPlayer.duration;
  audioPlayer.currentTime = current;
};

const playSong = (cancion) => {
  if (cancion !== null) {
    if (audioPlayer.currentTime > 0) {
      audioPlayer.play();
    } else {
      audioPlayer.play();
    }
    updateControls();
    if (!isRotating) {
      rotateImage();
      isRotating = true;
    }
  }
};

const pauseSong = () => {
  audioPlayer.pause();
  updateControls();
  stopRotation();
  isRotating = false;
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return padTime(minutes) + ":" + padTime(seconds);
};

const padTime = (time) => {
  if (typeof time !== "number") {
    return time; // Si el tiempo no es un número, devuelve el valor sin modificar
  }
  return time < 10 ? "0" + time : time;
};

// Agrega el event listener 'input' para actualizar el progreso y el color de la pista
range.addEventListener("input", updateProgress);

// Agrega el event listener 'mousedown' para indicar que el rango está siendo arrastrado
range.addEventListener("mousedown", () => {
  isDragging = true;
});

// Agrega el event listener 'mouseup' para indicar que se ha dejado de arrastrar el rango
range.addEventListener("mouseup", () => {
  isDragging = false;
});

// Agrega el event listener 'click' para cambiar la posición de reproducción solo si no se está arrastrando el rango
range.addEventListener("click", (event) => {
  if (!isDragging) {
    setProgress(event);
  }
});
