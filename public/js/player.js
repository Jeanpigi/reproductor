const playButton = document.getElementById('play-button');
const play = document.getElementById("play-btn");
const nextButton = document.getElementById('forward');
const prevButton = document.getElementById('backward');
const playerImage = document.getElementById('player-image');
const audioPlayer = document.getElementById('audio-player');
const audioAds = document.getElementById('audio-ads');
const titulo = document.getElementById("titulo");
const selection = document.getElementById("select");
const iconMenu = document.getElementById("icon-menu");
const playerTitle = document.getElementById('player__title');
const range = document.getElementById('duration__range');

const urlCanciones = '/api/canciones';
const urlAnuncios = '/api/anuncios';

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


const updateData = async () => {
    try {
        const responseSongs = await fetch(urlCanciones);
        const responseAds = await fetch(urlAnuncios);
        const songs = await responseSongs.json();
        const ads = await responseAds.json();
        const songData = songs.map(song => song.filename);
        const adData = ads.map(ad => ad.filename);

        // Verificar si hay cambios en la lista de canciones
        if (!arraysAreEqual(canciones, songData)) {
            canciones = songData;
            loadSongs();
        }

        // Verificar si hay cambios en la lista de anuncios
        if (!arraysAreEqual(anuncios, adData)) {
            anuncios = adData;
            // Actualizar la lógica relacionada con los anuncios
            // ...
        }

        // Continuar consultando la API en intervalos de tiempo
        setTimeout(updateData, 30 * 60 * 1000); // Consultar cada 30 minutes (30 * 60 * 1000 milliseconds)
    } catch (error) {
        console.error('Error:', error);
    }
};

// Resto del código...

// Función para verificar si dos arrays son iguales
const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
};

const loadSongs = () => {
    // Eliminar todas las opciones existentes antes de cargar las nuevas
    selection.innerHTML = "";

    for (let index = 0; index < canciones.length; index++) {
        const song = canciones[index];
        const option = document.createElement("option");
        option.textContent = song;
        option.value = index;
        selection.appendChild(option);
    }
}

const loadSong = (songIndex) => {
    if (songIndex !== actualSong) {
        changeActiveClass(actualSong, songIndex);
        actualSong = songIndex;
        audioPlayer.src = "/music/" + canciones[songIndex];
        playSong();
        changeSongtitle(songIndex);
    }
}

const rotateImage = () => {
    playerImage.style.transform += 'rotate(1deg)';
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
}


const updateProgress = (event) => {
    const { duration, currentTime } = event.target;

    // Verificar si duration y currentTime son números finitos
    if (typeof duration === 'number' && typeof currentTime === 'number' && isFinite(duration) && isFinite(currentTime) && duration !== 0 && currentTime !== 0) {
        const percent = (currentTime / duration) * 100;
        range.value = percent;
        range.style.setProperty('--progress', percent);
        document.querySelector('.start').textContent = formatTime(currentTime);
        document.querySelector('.end').textContent = formatTime(duration);
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
}

const pauseSong = () => {
    audioPlayer.pause();
    updateControls();
    stopRotation();
    isRotating = false;
}

const playAd = () => {
    let adIndex = Math.floor(Math.random() * anuncios.length); // Obtén un índice aleatorio para el anuncio
    audioAds.src = "/audios/" + anuncios[adIndex]; // Cambiar la ruta del archivo de audio de los anuncios aquí
  
    audioAds.onloadedmetadata = () => {
      pauseSong(); // Pausa la canción actual
      audioAds.play(); // Reproducir el anuncio
  
      // Esperar la duración del anuncio y reanudar la canción actual
      setTimeout(() => {
        playSong(); // Reanudar la canción
        hasPlayedAd = false;
      }, audioAds.duration * 1000);
    };
};
  
  
const changeActiveClass = (lastIndex, newIndex) => {
    const cancion = document.querySelectorAll("#select option");
    if (lastIndex !== null) {
        cancion[lastIndex].classList.remove("active");
    }
    cancion[newIndex].classList.add("active");
}

const changeSongtitle = (songIndex) => {
    titulo.innerText = canciones[songIndex];
}

const prevSong = () => {
    if (actualSong > 0) {
        loadSong(actualSong - 1);
    } else {
        loadSong(canciones.length - 1);
    }
}

const nextSong = () => {
    if (actualSong < canciones.length - 1) {
        loadSong(actualSong + 1);
    } else {
        loadSong(0);
    }
}

playButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
        if (primeraVez) {
            const randomIndex = Math.floor(Math.random() * canciones.length);
            loadSong(randomIndex);
            playSong();
            primeraVez = false;
        } else {
            playSong();
        }
    } else {
        pauseSong();
    }
});

audioPlayer.addEventListener('timeupdate', updateProgress);

audioPlayer.addEventListener('ended', function () {
    // Verificar si han pasado dos minutos y no se ha mostrado el anuncio aún
    if (audioPlayer.currentTime >= adDuration && !hasPlayedAd) {
        playAd();
        hasPlayedAd = true; // Marcar el anuncio como reproducido para evitar que se repita
    }
    nextSong(); // Ir a la siguiente canción al finalizar la actual
});

iconMenu.addEventListener("click", () => {
    selection.classList.toggle("hide");
    playerTitle.classList.toggle("hide");
});


selection.addEventListener('change', () => {
    const songIndex = parseInt(selection.value);
    loadSong(songIndex);
});

// Agrega el event listener 'input' para actualizar el progreso y el color de la pista
range.addEventListener('input', updateProgress);


// Agrega el event listener 'mousedown' para indicar que el rango está siendo arrastrado
range.addEventListener('mousedown', () => {
    isDragging = true;
});

// Agrega el event listener 'mouseup' para indicar que se ha dejado de arrastrar el rango
range.addEventListener('mouseup', () => {
    isDragging = false;
});

// Agrega el event listener 'click' para cambiar la posición de reproducción solo si no se está arrastrando el rango
range.addEventListener('click', (event) => {
    if (!isDragging) {
        setProgress(event);
    }
});

// Agrega el event listener 'click' para cambiar la posición de reproducción
range.removeEventListener('click', setProgress);


const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return padTime(minutes) + ':' + padTime(seconds);
}

const padTime = (time) => {
    if (typeof time !== 'number') {
        return time; // Si el tiempo no es un número, devuelve el valor sin modificar
    }
    return (time < 10 ? '0' + time : time);
}

nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", prevSong);

// Llamar a la función inicialmente para cargar los datos
updateData();