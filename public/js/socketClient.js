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
  // adDuration: 120, // Duración del anuncio en segundos (2 minutos)
  adDuration: 300, // Duración del anuncio en segundos (5 minutos)
  //adDuration: 600, // Duración del anuncio en segundos (10 minutos)
  // adDuration: 900, // Duración del anuncio en segundos (15 minutos)
  // adDuration: 1200, // Duración del anuncio en segundos (20 minutos)
  accumulatedDuration: 0,
  song: "",
  anuncio: "",
  isPausedByUser: false,
  cancionAnterior: "",
};

const socket = io();

const init = () => {
  elements.range.disabled = true;
  bindEvents();
};

const bindEvents = () => {
  socket.on("connect", () => {
    console.log(`El cliente se ha conectado al servidor de radio`);
  });

  socket.on("disconnect", () => {
    socket.connect();
  });

  socket.on("play", handleSocketPlay);
  socket.on("playAd", handleSocketPlayAd);
  socket.on("himno", handleHimnoPlay);

  elements.playButton.addEventListener("click", handlePlayButtonClick);
  elements.forwardButton.addEventListener("click", nextSong);
  elements.backwardButton.addEventListener("click", backSong);
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
  elements.audioPlayer.addEventListener("loadedmetadata", loadMetaData);
  elements.audioPlayer.addEventListener(
    "timeupdate",
    debounce(updateProgress, 100)
  );
  elements.audioPlayer.addEventListener("ended", handleAudioEnded);
  elements.audioPlayer.addEventListener("error", handleAudioError);
};

const handlePlayButtonClick = () => {
  if (elements.audioPlayer.paused) {
    if (settings.isPlaying) {
      playSong(settings.song);
    } else {
      socket.emit("play");
      settings.isPlaying = true;
    }
  } else {
    pauseSong();
    socket.emit("pause");
  }
};

const handleSocketPlay = (cancion) => {
  settings.song = cancion;
  elements.audioPlayer.src = cancion;
  playSong(cancion);
  changeSongtitle(cancion);
};

const handleHimnoPlay = (himnoPath) => {
  elements.audioPlayer.pause();
  settings.song = "";
  elements.range.value = 0;
  elements.audioPlayer.currentTime = 0;
  elements.audioPlayer.duration = 0;
  updateProgress();
  settings.song = himnoPath;
  elements.audioPlayer.src = himnoPath;
  elements.audioPlayer.load();
  playSong(himnoPath);
  changeSongtitle(himnoPath);
  stopRotation();
  settings.isRotating = false;
};

const handleAudioEnded = () => {
  if (settings.accumulatedDuration >= settings.adDuration) {
    socket.emit("ads");
    settings.accumulatedDuration = 0;
  } else {
    nextSong();
    settings.anuncio = "";
  }
};

const handleAudioError = () => {
  nextSong();
};

const loadMetaData = () => {
  settings.accumulatedDuration += parseFloat(elements.audioPlayer.duration);
  updateProgress();
};

const handleSocketPlayAd = (ad) => {
  if (!ad || typeof ad !== "string" || ad.trim() === "") {
    nextSong();
    return;
  }
  settings.song = "";
  settings.anuncio = ad;
  elements.audioPlayer.src = ad;
  playSong(ad);
  changeSongtitle(ad);
  stopRotation();
  settings.isRotating = false;
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

const changeSongtitle = (audio) => {
  const nombreArchivo = audio.split(/[\\/]/).pop();
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
    nextSong();
  }

  if (settings.isPlaying) {
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
  settings.isPausedByUser = true;
};

const nextSong = () => {
  settings.cancionAnterior = settings.song;
  socket.emit("play");
};

const backSong = () => {
  playSong(settings.cancionAnterior);
  changeSongtitle(settings.cancionAnterior);
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
