const playButton = document.getElementById("play-button");
const play = document.getElementById("play-btn");
const playerImage = document.getElementById("player-image");
const audioPlayer = document.getElementById("audio-player");
const audioAds = document.getElementById("audio-ads");
const titulo = document.getElementById("titulo");
const range = document.getElementById("duration__range");
const forwardButton = document.getElementById("forward");
const backwardButton = document.getElementById("backward");

// Establecer conexión con el servidor
let socket = io();
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
range.disabled = true;

let adIndex = 0;

const init = () => {
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

const getRandomSongIndex = () => {
  return Math.floor(Math.random() * canciones.length);
};

const loadSong = (songIndex) => {
  if (songIndex !== actualSong) {
    actualSong = songIndex;
    socket.emit("playMusic", canciones[songIndex]);
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

const playSong = () => {
  if (actualSong !== null) {
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

let adIndices = shuffleArray([...Array(anuncios.length).keys()]); // Mezclar los índices de los anuncios

// Función para mezclar un arreglo de manera aleatoria
function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// En la función playAd
const playAd = () => {
  if (adIndices.length === 0) {
    // Todos los anuncios han sido reproducidos, mezcla nuevamente
    adIndices = shuffleArray([...Array(anuncios.length).keys()]);
  }

  const nextAdIndex = adIndices.shift();

  audioAds.src = "/audios/" + anuncios[nextAdIndex];

  audioAds.onloadedmetadata = () => {
    pauseSong();
    audioAds.play();

    setTimeout(() => {
      nextSong();
      hasPlayedAd = false;
      changeSongtitle(actualSong, null); // Cambiar el título de la canción
    }, audioAds.duration * 1000);

    changeSongtitle(actualSong, nextAdIndex); // Cambiar el título del anuncio
  };
};

const changeSongtitle = (songIndex, adIndex) => {
  if (typeof adIndex !== "undefined" && adIndex !== null) {
    titulo.innerText = anuncios[adIndex];
  } else {
    titulo.innerText = canciones[songIndex];
  }
};

const nextSong = () => {
  const randomIndex = getRandomSongIndex();
  loadSong(randomIndex);
};

const togglePlay = () => {
  if (audioPlayer.paused) {
    if (primeraVez) {
      const randomIndex = Math.floor(Math.random() * canciones.length);
      loadSong(randomIndex);
      primeraVez = false;
    } else {
      playSong();
    }
  } else {
    pauseSong();
  }
};

const handleSongEnd = () => {
  // Verificar si han pasado dos minutos y no se ha mostrado el anuncio aún
  if (audioPlayer.currentTime >= adDuration && !hasPlayedAd) {
    playAd(adIndex);
    hasPlayedAd = true; // Marcar el anuncio como reproducido para evitar que se repita
  } else {
    nextSong(); // Ir a la siguiente canción al finalizar la actual
  }
};

const playNextSongOrAd = () => {
  nextSong();
  socket.emit("playMusic", actualSong); // Emitir evento de reproducción al servidor
};

const rewindOrPrevious = () => {
  if (audioPlayer.currentTime <= 5) {
    // Retrocede si el tiempo actual es menor o igual a 5 segundos
    if (actualSong > 0) {
      loadSong(actualSong - 1);
      socket.emit("playMusic", actualSong); // Emitir evento de reproducción al servidor
    }
  } else {
    audioPlayer.currentTime = 0; // Reinicia la canción si el tiempo actual es mayor a 5 segundos
  }
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

init();
