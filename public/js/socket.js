const elements = {
  playButton: document.getElementById("play-button"),
  play: document.getElementById("play-btn"),
  audioPlayer: document.getElementById("audio-player"),
  playerImage: document.getElementById("player-image"),
  titulo: document.getElementById("titulo"),
  range: document.getElementById("duration__range"),
  recordButton: document.getElementById("record-button"),
};

const settings = {
  isRotating: false,
  isDragging: false,
  isPlaying: false,
  adDuration: 600,
  animationId: null,
  accumulatedDuration: 0,
};

const SERVER_URL = "http://localhost:3007";
const socket = io(SERVER_URL);

const init = () => {
  bindEvents();
};

const bindEvents = () => {
  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("play", playSong);
  socket.on("pause", pauseAudio);
  socket.on("playAd", handlePlayAd);

  elements.range.addEventListener("input", updateProgress);
  elements.range.addEventListener("mousedown", handleMouseDown);
  elements.range.addEventListener("mouseup", handleMouseUp);
  elements.range.addEventListener("click", handleClick);

  elements.audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
  elements.audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
  elements.audioPlayer.addEventListener("ended", handleSongEnd);
};

const handleConnect = () => {
  console.log("Conectado al servidor");
};

const handleDisconnect = () => {
  console.log("Se ha perdido la conexión con el servidor");
  socket.connect();
};

const handlePlayAd = (ad) => {
  console.log(ad);
  settings.anuncio = ad;
};

const handleMouseDown = () => {
  settings.isDragging = true;
};

const handleMouseUp = () => {
  settings.isDragging = false;
};

const handleClick = (event) => {
  if (!settings.isDragging) {
    setProgress(event);
  }
};

const handleLoadedMetadata = () => {
  settings.accumulatedDuration += parseFloat(elements.audioPlayer.duration);
  updateProgress();
};

const handleTimeUpdate = () => {
  if (!settings.isDragging) {
    requestAnimationFrame(updateProgress);
  }
};

const playSong = (cancion) => {
  pauseAudio();
  changeSongtitle(cancion);
  elements.audioPlayer.src = cancion;
  elements.audioPlayer.play();
  settings.isPlaying = true;
  if (!settings.isRotating) {
    rotateImage();
    settings.isRotating = true;
  }
};

const pauseAudio = () => {
  if (settings.isPlaying) {
    elements.audioPlayer.pause();
    stopRotation();
    settings.isPlaying = false;
  }
};

const rotateImage = () => {
  if (settings.isPlaying) {
    elements.playerImage.style.transform += "rotate(1deg)";
    settings.animationId = requestAnimationFrame(rotateImage);
  } else {
    settings.isRotating = false;
  }
};

const stopRotation = () => {
  cancelAnimationFrame(settings.animationId);
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

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${padTime(minutes)}:${padTime(seconds)}`;
};

const padTime = (time) => (time < 10 ? `0${time}` : time);

const handleSongEnd = () => {
  console.log("Terminó la canción");
  if (settings.anuncio) {
    playSong(settings.anuncio);
    settings.anuncio = "";
  } else {
    socket.on("play", playSong);
  }
};

init();
