const playButton = document.getElementById("play-button");
const play = document.getElementById("play-btn");
const playerImage = document.getElementById("player-image");
const audioPlayer = document.getElementById("audio-player");
const audioAds = document.getElementById("audio-ads");
const titulo = document.getElementById("titulo");
const range = document.getElementById("duration__range");
const forwardButton = document.getElementById("forward");
const backwardButton = document.getElementById("backward");

let socket = io();
let canciones = [];
let anuncios = [];
let actualSong = null;
let isRotating = false;
let animationId;
let primeraVez = true;
let adDuration = 120; // Cambiar según la duración real del anuncio

const iniciar = () => {
  socket.on("canciones", handleCancion);
  socket.on("anuncios", handleAnuncio);

  playButton.addEventListener("click", togglePlay);
  range.addEventListener("input", updateProgress);
  range.addEventListener("mousedown", () => {
    isDragging = true;
  });
  range.addEventListener("mouseup", () => {
    isDragging = false;
  });
  range.addEventListener("click", (event) => {
    if (!isDragging) {
      setProgress(event);
    }
  });
  forwardButton.addEventListener("click", playNextSongOrAd);
  backwardButton.addEventListener("click", rewindOrPrevious);
  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("ended", handleSongEnd);
};

const handleCancion = ({ nombreCancion, extension }) => {
  canciones.push(nombreCancion + extension);
};

const handleAnuncio = ({ nombreAnuncio, extension }) => {
  anuncios.push(nombreAnuncio + extension);
};

const togglePlay = () => {
  if (audioPlayer.paused) {
    if (primeraVez) {
      primeraVez = false;
      loadRandomSong();
    } else {
      playSong();
    }
  } else {
    pauseSong();
  }
};

const loadRandomSong = () => {
  const randomIndex = getRandomSongIndex();
  loadSong(randomIndex);
  socket.emit("playMusic", randomIndex);
};

const playSong = () => {
  if (actualSong !== null) {
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
  updateControls();
  stopRotation();
  isRotating = false;
};

const playAd = () => {
  if (anuncios.length === 0) return;

  const adIndex = getNextAdIndex();
  const adPath = "/audios/" + anuncios[adIndex];

  audioAds.src = adPath;
  audioAds.onloadedmetadata = () => {
    pauseSong();
    audioAds.play();

    setTimeout(() => {
      playNextSongOrAd();
      changeSongtitle(actualSong);
    }, audioAds.duration * 1000);
  };
};

const getNextAdIndex = () => {
  if (anuncios.length === 1) return 0;
  return Math.floor(Math.random() * anuncios.length);
};

const playNextSongOrAd = () => {
  if (audioPlayer.currentTime >= adDuration) {
    playAd();
  } else {
    nextSong();
  }
};

const updateProgress = () => {
  const { duration, currentTime } = audioPlayer;

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

const rewindOrPrevious = () => {
  if (audioPlayer.currentTime <= 5) {
    if (actualSong > 0) {
      loadSong(actualSong - 1);
      socket.emit("playMusic", actualSong);
    }
  } else {
    audioPlayer.currentTime = 0;
  }
};

const handleSongEnd = () => {
  if (audioPlayer.currentTime >= adDuration) {
    playAd();
  } else {
    nextSong();
  }
};

// Resto de las funciones (getRandomSongIndex, loadSong, rotateImage, etc.)

const getRandomSongIndex = () => {
  return Math.floor(Math.random() * canciones.length);
};

const loadSong = (songIndex) => {
  if (songIndex !== actualSong) {
    actualSong = songIndex;
    audioPlayer.src = "/music/" + canciones[songIndex];
    playSong();
    changeSongtitle(songIndex);
  }
};

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

const changeSongtitle = (songIndex) => {
  titulo.innerText = canciones[songIndex];
};

const padTime = (time) => {
  if (typeof time !== "number") {
    return time;
  }
  return time < 10 ? "0" + time : time;
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return padTime(minutes) + ":" + padTime(seconds);
};

// Inicializar la función principal
iniciar();
