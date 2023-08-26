// Elementos del DOM
const elements = {
  playButton: document.getElementById("play-button"),
  play: document.getElementById("play-btn"),
  audioPlayer: document.getElementById("audio-player"),
  playerImage: document.getElementById("player-image"),
  titulo: document.getElementById("titulo"),
  range: document.getElementById("duration__range"),
  forwardButton: document.getElementById("forward"),
  backwardButton: document.getElementById("backward"),
  recordButton: document.getElementById("record-button"),
};

// Configuración inicial
let settings = {
  isRotating: false,
  pausedTime: 0,
  animationId: null,
  isDragging: false,
  isPlaying: false,
  adDuration: 300, // Duración del anuncio en segundos (5 minutos)
  accumulatedDuration: 0,
  originalMusicVolume: 1,
  isMicrophoneActive: false,
};

const socket = io();

let isPausedByUser = false;

const init = () => {
  elements.range.disabled = true;
  bindEvents();
};

const bindEvents = () => {
  socket.on("connect", () => {
    console.log("Conectado al servidor");
  });

  socket.on("disconnect", () => {
    console.log("Se ha perdido la conexión con el servidor");
    socket.connect();
  });

  socket.on("play", handleSocketPlay);
  socket.on("playAd", handleSocketPlayAd);

  elements.playButton.addEventListener("click", handlePlayButtonClick);
  elements.forwardButton.addEventListener("click", nextSong);
  elements.range.addEventListener("input", updateProgress);
  elements.range.addEventListener("mousedown", () => {
    settings.isDragging = true;
  });
  elements.range.addEventListener("mouseup", () => {
    settings.isDragging = false;
  });
  elements.range.addEventListener("click", (event) => {
    if (!settings.isDragging) setProgress(event);
  });
  elements.audioPlayer.addEventListener("loadedmetadata", function () {
    console.log("La duración del audio es: ", elements.audioPlayer.duration);
    settings.accumulatedDuration += parseFloat(elements.audioPlayer.duration);
    updateProgress();
  });
  elements.audioPlayer.addEventListener(
    "timeupdate",
    debounce(updateProgress, 100)
  );
  elements.audioPlayer.addEventListener("ended", handleAudioEnded);
  elements.recordButton.addEventListener("click", handleMicrophone);
};

const handleMicrophone = () => {
  console.log("Microphone is clicked");
  settings.isMicrophoneActive = !settings.isMicrophoneActive; // Cambiar el estado del micrófono

  startMicrophone();

  // Restaurar el volumen de la música y detener el micrófono si ya no está activo
  if (!settings.isMicrophoneActive) {
    elements.audioPlayer.volume = settings.originalMusicVolume;
  }

  elements.recordButton.classList.toggle("orange", settings.isMicrophoneActive);
};

const startMicrophone = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const microphoneNode = audioContext.createMediaStreamSource(stream);

    // Crear nodo para controlar el volumen del micrófono
    const gainNode = audioContext.createGain();
    gainNode.gain.value = settings.isMicrophoneActive ? 2.0 : 0.5;

    // Conectar el nodo del micrófono al nodo de ganancia
    microphoneNode.connect(gainNode);

    // Conectar el nodo de ganancia al nodo de salida (altavoces)
    gainNode.connect(audioContext.destination);

    // Cambiar el volumen de la música según el estado del micrófono
    elements.audioPlayer.volume = settings.isMicrophoneActive
      ? 0.5
      : settings.originalMusicVolume;

    // Actualizar el volumen original de la música si se activa/desactiva el micrófono
    if (!settings.isMicrophoneActive) {
      settings.originalMusicVolume = elements.audioPlayer.volume;
    }
  } catch (error) {
    if (error.name === "NotAllowedError") {
      console.log("El usuario ha denegado el acceso al micrófono.");
    } else {
      console.error("Error al acceder al micrófono:", error);
    }
  }
};

const handlePlayButtonClick = () => {
  if (elements.audioPlayer.paused) {
    if (settings.isPlaying) {
      playSong();
      console.log("Ingresando cuando isPlayig in handlePlayButtonClick");
    } else {
      if (isPausedByUser) {
        elements.audioPlayer.currentTime = settings.pausedTime;
        isPausedByUser = false;
        console.log("IspausedByUser in handlePlayButtonClick");
      } else {
        socket.emit("play");
        console.log(
          "Ingresando cuando play del socket in handlePlayButtonClick"
        );
      }
      settings.isPlaying = true;
    }
  } else {
    pauseSong();
    socket.emit("pause");
    console.log("Ingresando cuando pause del socket in handlePlayButtonClick");
  }
};

const handleSocketPlay = (cancion) => {
  console.log("Reproduciendo cancion:", cancion);
  elements.audioPlayer.src = cancion;
  playSong(cancion);
  changeSongtitle(cancion);
};

const handleAudioEnded = () => {
  if (settings.accumulatedDuration >= settings.adDuration) {
    socket.emit("ads");
    settings.accumulatedDuration = 0;
  } else {
    nextSong();
  }
};

const handleSocketPlayAd = (ad) => {
  console.log("Reproduciendo anuncio:", ad);
  elements.audioPlayer.src = ad;
  playSong(ad);
};

const rotateImage = () => {
  if (settings.isPlaying) {
    elements.playerImage.style.transform += "rotate(1deg)";
    settings.animationId = requestAnimationFrame(rotateImage);
  }
};

const stopRotation = () => {
  cancelAnimationFrame(settings.animationId);
};

const updateControls = () => {
  const isPaused = elements.audioPlayer.paused;

  if (isPaused) {
    elements.play.classList.replace("fa-pause", "fa-play");
    elements.playButton.classList.remove("orange");
  } else {
    elements.play.classList.replace("fa-play", "fa-pause");
    elements.playButton.classList.add("orange");
  }
};

const changeSongtitle = (cancion) => {
  const nombreArchivo = cancion.substring(cancion.lastIndexOf("/") + 1);
  elements.titulo.innerText = nombreArchivo;
};

const updateProgress = () => {
  const { duration, currentTime } = elements.audioPlayer;
  const percent = (currentTime / duration) * 100;
  const formattedCurrentTime = formatTime(currentTime);
  const formattedDuration = formatTime(duration);

  elements.range.value = percent;
  elements.range.style.setProperty("--progress", percent);
  document.querySelector(".start").textContent = formattedCurrentTime;
  document.querySelector(".end").textContent = formattedDuration;
};

const setProgress = (event) => {
  const totalWidth = elements.range.offsetWidth;
  const progressWidth = event.offsetX;
  const current = (progressWidth / totalWidth) * elements.audioPlayer.duration;
  elements.audioPlayer.currentTime = current;
};

const playSong = (cancion) => {
  if (!cancion) {
    return;
  }

  // Establecer el tiempo de reproducción si se ha almacenado previamente
  if (settings.pausedTime > 0) {
    elements.audioPlayer.currentTime = settings.pausedTime;
    settings.pausedTime = 0;
  }

  elements.audioPlayer.play();
  updateControls();

  if (!settings.isRotating) {
    rotateImage();
    settings.isRotating = true;
  }
};

const pauseSong = () => {
  elements.audioPlayer.pause();
  updateControls();
  stopRotation();
  settings.isRotating = false;

  settings.pausedTime = elements.audioPlayer.currentTime;
  isPausedByUser = true;
};

const nextSong = () => {
  settings.isPlaying = false;
  socket.emit("play");
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${padTime(minutes)}:${padTime(seconds)}`;
};

const padTime = (time) => (time < 10 ? `0${time}` : time);

// Debounce function that takes in another function and a delay time delay.
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

init();
