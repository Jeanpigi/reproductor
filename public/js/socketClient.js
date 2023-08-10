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

let animationId; // Declaración de la variable animationId

// esta variable permite reproducir la canción aleaotoriamente la primera vez
let primeraVez = true;

const adDuration = 120; // Duración del anuncio en segundos (2 minutos)
let hasPlayedAd = false; // Variable para controlar si el anuncio ya ha sido reproducido

let isDragging = false; // Variable para controlar si el rango está siendo arrastrado

range.disabled = true;

let adIndex = 0;

// Crear instancia de Howl para reproducir canciones
let sound = new Howl({
  src: [], // Se proporcionará la ruta correcta en el evento playMusic
  html5: true,
  onplayerror: function () {
    console.log("Error al reproducir el audio");
  },
  onend: function () {
    nextSong();
  },
});

socket.on("canciones", ({ nombreCancion, extension }) => {
  canciones.push(nombreCancion + extension);
});

socket.on("anuncios", ({ nombreAnuncio, extension }) => {
  anuncios.push(nombreAnuncio + extension);
});

// Escuchar eventos del socket
socket.on("playMusic", (songIndex) => {
  // Reproducir música
  loadSong(songIndex);
  playSong();
});

socket.on("playAd", (adIndex) => {
  loadSong(actualSong);
  playAd(adIndex);
});

socket.on("pauseMusic", () => {
  // Pausar música
  pauseSong();
});

const loadSong = (songIndex) => {
  if (songIndex !== actualSong) {
    actualSong = songIndex;
    const songSrc = "/music/" + canciones[songIndex];
    audioPlayer.src = songSrc;
    sound.unload(); // Descargar canción anterior antes de cargar una nueva
    sound.load({ src: [songSrc] }); // Cargar la nueva canción en Howler.js
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

socket.on("sync", (currentTime) => {
  // Recibir mensaje de sincronización y establecer el tiempo de reproducción del audio
  audioPlayer.currentTime = parseFloat(currentTime);
});

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
      sound.play(); // Iniciar reproducción en Howler.js
    } else {
      audioPlayer.play();
      sound.play(); // Iniciar reproducción en Howler.js
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
  sound.pause();
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

  const nextAdIndex = adIndices.shift(); // Obtén y elimina el próximo índice de anuncio

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
  if (actualSong < canciones.length - 1) {
    loadSong(actualSong + 1);
  } else {
    loadSong(0);
  }
};

// Agrega el event listener para el botón de reproducción
playButton.addEventListener("click", () => {
  if (audioPlayer.paused) {
    if (primeraVez) {
      const randomIndex = Math.floor(Math.random() * canciones.length);
      loadSong(randomIndex);
      socket.emit("playMusic", randomIndex); // Emitir evento de reproducción al servidor
      primeraVez = false;
    } else {
      playSong();
      socket.emit("playMusic", actualSong); // Emitir evento de reproducción al servidor
    }
  } else {
    pauseSong();
    socket.emit("pauseMusic"); // Emitir evento de pausa al servidor
  }
});

audioPlayer.addEventListener("timeupdate", updateProgress);

audioPlayer.addEventListener("ended", function () {
  // Verificar si han pasado dos minutos y no se ha mostrado el anuncio aún
  if (audioPlayer.currentTime >= adDuration && !hasPlayedAd) {
    playAd(adIndex);
    hasPlayedAd = true; // Marcar el anuncio como reproducido para evitar que se repita
  } else {
    nextSong(); // Ir a la siguiente canción al finalizar la actual
  }
});

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

// Agregar evento al botón de adelantar
forwardButton.addEventListener("click", () => {
  nextSong();
  socket.emit("playMusic", actualSong); // Emitir evento de reproducción al servidor
});

// Agregar evento al botón de retroceder
backwardButton.addEventListener("click", () => {
  if (audioPlayer.currentTime <= 5) {
    // Retrocede si el tiempo actual es menor o igual a 5 segundos
    if (actualSong > 0) {
      loadSong(actualSong - 1);
      socket.emit("playMusic", actualSong); // Emitir evento de reproducción al servidor
    }
  } else {
    audioPlayer.currentTime = 0; // Reinicia la canción si el tiempo actual es mayor a 5 segundos
  }
});

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
