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
  adDuration: 600, // Duración del anuncio en segundos (10 minutos)
  accumulatedDuration: 0,
  originalMusicVolume: 1,
  isMicrophoneActive: false,
  song: "",
  anuncio: "",
  isPausedByUser: false,
  audioContext: null,
  microphoneNode: null,
};

const socket = io();

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
  socket.on("microphoneData", (data) => {
    if (settings.isMicrophoneActive) {
      const audioBuffer = settings.audioContext.createBuffer(
        1,
        data.length,
        settings.audioContext.sampleRate
      );
      const channelData = audioBuffer.getChannelData(0);
      channelData.set(data);

      const source = settings.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(settings.audioContext.destination);
      source.start();
    }
  });

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
  settings.isMicrophoneActive = !settings.isMicrophoneActive; // Cambiar el estado del micrófono

  if (settings.isMicrophoneActive) {
    startMicrophone();
    console.log("Microphone is Activo");
  } else {
    stopMicrophone();
    console.log("Microphone is Inactivo");
  }

  elements.recordButton.classList.toggle("orange", settings.isMicrophoneActive);
};
const startMicrophone = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    settings.audioContext = new AudioContext();
    settings.microphoneNode =
      settings.audioContext.createMediaStreamSource(stream);

    // Crear nodo para controlar el volumen del micrófono
    const microphoneGainNode = settings.audioContext.createGain();
    microphoneGainNode.gain.value = 1.0; // Volumen normal del micrófono

    // Crear nodo de script para procesar los datos del micrófono
    const bufferSize = 4096;
    const scriptNode = settings.audioContext.createScriptProcessor(
      bufferSize,
      1,
      1
    );

    scriptNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0); // Canal de audio mono

      // Enviar los datos del micrófono al servidor a través del socket
      if (settings.isMicrophoneActive) {
        socket.emit("microphoneData", inputData);
      }
    };

    // Conectar el nodo de captura al nodo de ganancia del micrófono
    settings.microphoneNode.connect(microphoneGainNode);
    microphoneGainNode.connect(scriptNode);
    scriptNode.connect(settings.audioContext.destination);
  } catch (error) {
    if (error.name === "NotAllowedError") {
      console.log("El usuario ha denegado el acceso al micrófono.");
    } else {
      console.error("Error al acceder al micrófono:", error);
    }
  }
};

const stopMicrophone = () => {
  if (settings.microphoneNode) {
    settings.microphoneNode.disconnect();
  }

  if (settings.audioContext && settings.audioContext.state !== "closed") {
    settings.audioContext.close();
  }

  // Restaurar el volumen de la música
  elements.audioPlayer.volume = settings.originalMusicVolume;
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
  console.log("Reproduciendo cancion:", cancion);
  settings.song = cancion;
  elements.audioPlayer.src = cancion;
  playSong(cancion);
  changeSongtitle(cancion);
};

const handleAudioEnded = () => {
  console.log(
    `Esta es la acumulación de la duración ${settings.accumulatedDuration}`
  );
  if (settings.accumulatedDuration >= settings.adDuration) {
    socket.emit("ads");
    settings.accumulatedDuration = 0;
  } else {
    nextSong();
    settings.anuncio = "";
  }
};

const handleSocketPlayAd = (ad) => {
  console.log("Reproduciendo anuncio:", ad);
  settings.anuncio = ad;
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
