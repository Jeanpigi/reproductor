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
  adDuration: 1200, // Duración del anuncio en segundos (20 minutos)
  accumulatedDuration: 0,
  song: "",
  anuncio: "",
  isPausedByUser: false,
  cancionAnterior: "",
  himno: "himno/HimnoNacional.m4a",
};

const socket = io();
// Define la hora en la que deseas reproducir el himno (por ejemplo, a las 6:00 AM, 12:00 PM y 6:00 PM)
const horasHimno = [6, 12, 18];

const init = () => {
  elements.range.disabled = true;
  bindEvents();
  scheduleNextPlayback();
};

const bindEvents = () => {
  socket.on("connect", () => {
    console.log(`El cliente se ha conectado al servidor de radio`);
  });

  socket.on("disconnect", () => {
    console.log("Se ha perdido la conexión con el servidor");
    socket.connect();
  });

  socket.on("play", handleSocketPlay);
  socket.on("playAd", handleSocketPlayAd);

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
  if (!cancion || typeof cancion !== "string" || cancion.trim() === "") {
    playSongOffline();
    return;
  }
  settings.song = cancion;
  elements.audioPlayer.src = cancion;
  playSong(cancion);
  changeSongtitle(cancion);

  // Agregar la canción al localStorage
  addUniqueSongToLocalStorage(cancion);
};

const addUniqueSongToLocalStorage = (song) => {
  let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

  // Verificar si la canción ya está en la lista antes de agregarla
  if (!playlist.includes(song)) {
    playlist.push(song);
    localStorage.setItem("playlist", JSON.stringify(playlist));
  }
};

const getRandomSongFromLocalStorage = () => {
  let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

  if (playlist.length === 0) {
    return null; // No hay canciones en la lista
  }

  // Obtener una canción aleatoria
  const randomIndex = Math.floor(Math.random() * playlist.length);
  const randomSong = playlist.splice(randomIndex, 1)[0];

  // Actualizar la lista en el localStorage
  localStorage.setItem("playlist", JSON.stringify(playlist));

  return randomSong;
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

const loadMetaData = () => {
  settings.accumulatedDuration += parseFloat(elements.audioPlayer.duration);
  updateProgress();
};

// Función para reproducir el himno
const reproducirHimno = () => {
  const horaActual = new Date().getHours();
  if (horasHimno.includes(horaActual)) {
    pauseSong();
    settings.song = settings.himno;
    elements.audioPlayer.src = settings.himno;
    playSong(settings.himno);
    changeSongtitle(settings.himno);
  }
};

// Función para programar la próxima reproducción del himno
const scheduleNextPlayback = () => {
  const now = new Date();
  const minutesRemaining = 60 - now.getMinutes();
  const secondsRemaining = 60 - now.getSeconds();
  const millisecondsUntilNextHour =
    (minutesRemaining * 60 + secondsRemaining) * 1000;

  setTimeout(() => {
    reproducirHimno();
    scheduleNextPlayback();
  }, millisecondsUntilNextHour);
};

const handleSocketPlayAd = (ad) => {
  if (!ad || typeof ad !== "string" || ad.trim() === "") {
    nextSong();
    return;
  }

  settings.anuncio = ad;
  elements.audioPlayer.src = ad;
  playSong(ad);
  changeSongtitle(ad);
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
    return;
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

const playSongOffline = () => {
  const localmusic = getRandomSongFromLocalStorage();
  console.log(`Este es localmusic ${localmusic}`);
  playSong(localmusic);
  changeSongtitle(localmusic);
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
  console.log(settings.cancionAnterior);
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
