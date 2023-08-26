const elements = {
  playButton: document.getElementById("play-button"),
  play: document.getElementById("play-btn"),
  playerImage: document.getElementById("player-image"),
  audioPlayer: document.getElementById("audio-player"),
  audioAds: document.getElementById("audio-ads"),
  titulo: document.getElementById("titulo"),
  range: document.getElementById("duration__range"),
  forwardButton: document.getElementById("forward"),
  backwardButton: document.getElementById("backward"),
  recordButton: document.getElementById("record-button"),
  recordIcon: document.getElementById("record-icon"),
};

// Establecer conexión con el servidor
let socket = io();

elements.range.disabled = true;

let canciones = [];
let anuncios = [];
let actualSong = null;
let isRotating = false;
let animationId;
let primeraVez = true;
let adDuration = 120;
// const adDuration = 7200; // Duración del anuncio en segundos (2 horas)
let hasPlayedAd = false;
let isDragging = false;
let adIndex = 0;
let isMicrophoneActive = false;
let originalMusicVolume = 1.0;

const init = () => {
  attachEventListeners();
  initializeAudioContext();
};

const attachEventListeners = () => {
  socket.on("canciones", handleCancion);
  socket.on("anuncios", handleAnuncio);
  socket.on("sync", currentSong);

  elements.playButton.addEventListener("click", togglePlay);
  elements.range.addEventListener("input", updateProgress);
  elements.range.addEventListener("mousedown", () => (isDragging = true));
  elements.range.addEventListener("mouseup", () => (isDragging = false));
  elements.range.addEventListener(
    "click",
    (event) => !isDragging && setProgress(event)
  );

  elements.forwardButton.addEventListener("click", nextSong);
  elements.backwardButton.addEventListener("click", backSong);
  elements.audioPlayer.addEventListener("timeupdate", updateProgress);
  elements.audioPlayer.addEventListener("ended", handleSongEnd);

  elements.recordButton.addEventListener("click", handleMicrophone);
};

const initializeAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();
};

const handleCancion = ({ nombreCancion, extension }) => {
  canciones.push(nombreCancion + extension);
};

const handleAnuncio = ({ nombreAnuncio, extension }) => {
  anuncios.push(nombreAnuncio + extension);
};

const currentSong = (currentTime) => {
  elements.audioPlayer.currentTime = parseFloat(currentTime);
};

const getRandomSongIndex = () => {
  return Math.floor(Math.random() * canciones.length);
};

const loadSong = (songIndex) => {
  if (songIndex !== actualSong) {
    actualSong = songIndex;
    const songUrl = `/music/${canciones[songIndex]}`;
    socket.emit("playMusic", canciones[songIndex]);
    elements.audioPlayer.src = songUrl;
    playSong();
    changeSongtitle(songIndex);
  }
};

const handleMicrophone = () => {
  console.log("Microphone is clicked");
  isMicrophoneActive = !isMicrophoneActive; // Cambiar el estado del micrófono

  startMicrophone();

  // Restaurar el volumen de la música y detener el micrófono si ya no está activo
  if (!isMicrophoneActive) {
    elements.audioPlayer.volume = originalMusicVolume;
  }

  elements.recordButton.classList.toggle("orange", isMicrophoneActive);
};

const startMicrophone = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioContext = new AudioContext();
    const microphoneNode = audioContext.createMediaStreamSource(stream);

    // Crear nodo para controlar el volumen del micrófono
    const gainNode = audioContext.createGain();
    gainNode.gain.value = isMicrophoneActive ? 2.0 : 0.5;

    // Conectar el nodo de volumen del micrófono a un nodo de mezcla
    const mixerNode = audioContext.createGain();
    gainNode.connect(mixerNode);

    // Conectar el nodo de mezcla al nodo de salida (altavoces)
    const speakersNode = audioContext.destination;
    mixerNode.connect(speakersNode);

    // Conectar también el nodo de música al nodo de mezcla
    elements.audioPlayer.connect(mixerNode);

    // Cambiar el volumen de la música según el estado del micrófono
    elements.audioPlayer.volume = isMicrophoneActive
      ? 0.5
      : originalMusicVolume;

    // Actualizar el volumen original de la música si se activa/desactiva el micrófono
    if (isMicrophoneActive) {
      originalMusicVolume = elements.audioPlayer.volume;
    }
  } catch (error) {
    if (error.name === "NotAllowedError") {
      console.log("El usuario ha denegado el acceso al micrófono.");
    } else {
      console.error("Error al acceder al micrófono:", error);
    }
  }
};

const rotateImage = () => {
  elements.playerImage.style.transform += "rotate(1deg)";
  animationId = requestAnimationFrame(rotateImage);
};

const stopRotation = () => {
  cancelAnimationFrame(animationId);
};

const updateControls = () => {
  const isPaused = elements.audioPlayer.paused;
  elements.play.classList.toggle("fa-play", isPaused);
  elements.play.classList.toggle("fa-pause", !isPaused);
  elements.playButton.classList.toggle("orange", !isPaused);
};

const updateProgress = () => {
  const { duration, currentTime } = elements.audioPlayer;

  // Verificar si duration y currentTime son números finitos
  if (
    Number.isFinite(duration) &&
    Number.isFinite(currentTime) &&
    duration !== 0
  ) {
    const percent = (currentTime / duration) * 100;
    elements.range.value = percent;
    elements.range.style.setProperty("--progress", `${percent}%`);
    document.querySelector(".start").textContent = formatTime(currentTime);
    document.querySelector(".end").textContent = formatTime(duration);
  }
};

const setProgress = (event) => {
  const { offsetWidth: totalWidth } = range;
  const { offsetX: progressWidth } = event;
  const current = (progressWidth / totalWidth) * audioPlayer.duration;
  elements.audioPlayer.currentTime = current;
};

const playSong = () => {
  if (actualSong !== null || elements.audioPlayer.currentTime > 0) {
    elements.audioPlayer.play();
    updateControls();
    if (!isRotating) {
      rotateImage();
      isRotating = true;
    }
  }
};

const pauseSong = () => {
  elements.audioPlayer.pause();
  updateControls();
  stopRotation();
  isRotating = false;
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

let adIndices = shuffleArray([...Array(anuncios.length).keys()]);

const playAd = () => {
  if (adIndices.length === 0) {
    adIndices = shuffleArray([...Array(anuncios.length).keys()]);
  }

  const nextAdIndex = adIndices.shift(); // Obtén y elimina el próximo índice de anuncio

  elements.audioAds.src = "/audios/" + anuncios[nextAdIndex];

  elements.audioAds.onloadedmetadata = () => {
    pauseSong();
    elements.audioAds.play();

    setTimeout(() => {
      nextSong();
      hasPlayedAd = false;
      changeSongtitle(actualSong, null);
    }, elements.audioAds.duration * 1000);

    changeSongtitle(actualSong, nextAdIndex);
  };
};

const changeSongtitle = (songIndex, adIndex) => {
  const text =
    typeof adIndex !== "undefined" && adIndex !== null
      ? anuncios[adIndex]
      : canciones[songIndex];
  elements.titulo.textContent = text;
};

const nextSong = () => {
  const randomIndex = getRandomSongIndex();
  loadSong(randomIndex);
};

const togglePlay = () => {
  if (elements.audioPlayer.paused) {
    if (primeraVez) {
      const randomIndex = Math.floor(Math.random() * canciones.length);
      loadSong(randomIndex);
      primeraVez = false;
    } else {
      playSong();
    }
    socket.on("resumeStream");
  } else {
    pauseSong();
    socket.emit("pauseMusic");
  }
};

const handleSongEnd = () => {
  if (isMicrophoneActive) {
    console.log("Micrófono activo. No se pueden reproducir anuncios.");
    nextSong();
    return;
  }

  if (elements.audioPlayer.currentTime >= adDuration && !hasPlayedAd) {
    playAd(adIndex);
    hasPlayedAd = true;
  } else {
    nextSong();
  }
};

const backSong = () => {
  if (elements.audioPlayer.currentTime <= 5 && actualSong > 0) {
    loadSong(actualSong - 1);
  } else {
    elements.audioPlayer.currentTime = 0;
  }
};
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const padTime = (time) => {
  return typeof time !== "number" ? time : time < 10 ? "0" + time : time;
};

init();
