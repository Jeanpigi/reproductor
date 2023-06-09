const playButton = document.getElementById('play-button');
const play = document.getElementById("play-btn");
const nextButton = document.getElementById('forward');
const prevButton = document.getElementById('backward');
const playerImage = document.getElementById('player-image');
const audioPlayer = document.getElementById('audio-player');
const titulo = document.getElementById("titulo");
const selection = document.getElementById("select");
const range = document.getElementById('duration__range');

const urlCanciones = '/api/canciones';
const urlAnuncios = '/api/anuncios';

let canciones = [];
let anuncios = [];

let actualSong = null;
let isRotating = false;

// esta variable permite reproducir la canción aleaotoriamente la primera vez
let primeraVez = true;

const adDuration = 120; // Duración del anuncio en segundos (2 minutos)
let hasPlayedAd = false; // Variable para controlar si el anuncio ya ha sido reproducido



const getData = async () => {
    try {
        const response = await fetch(urlCanciones);
        const responseAds = await fetch(urlAnuncios);
        const songs = await response.json();
        const ads = await responseAds.json();

        //Esto es para recorrer y solo agregar lo que se necesita
        const songData = songs.map(song => song.filename);
        const adsData = ads.map(ad => ad.filename);

        canciones = songData;
        anuncios = adsData;

        loadSongs();
    } catch (error) {
        console.error('Error:', error);
    }
}

const loadSongs = () => {
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


const playAd = () => {
    pauseSong(); // Pausa la canción actual
    const adIndex = Math.floor(Math.random() * anuncios.length); // Obtén un índice aleatorio para el anuncio
    // Cargar y reproducir el anuncio
    audioPlayer.src = "/publicidad/" + adsData[adIndex];
    audioPlayer.play();

    // Esperar la duración del anuncio y reanudar la canción actual
    setTimeout(() => {
        audioPlayer.src = "/music/" + canciones[actualSong];
        playSong(); // Reanudar la canción
        hasPlayedAd = false;
    }, adDuration * 1000);
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
    const { duration, currentTime } = event.srcElement;
    const percent = (currentTime / duration) * 100;
    range.value = percent;
}

const setProgress = (event) => {
    const totalWidth = this.offsetWidth;
    const progressWidth = event.offsetX;
    const current = (progressWidth / totalWidth) * audioPlayer.duration;
    audioPlayer.currentTime = current;
}

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
    if (primeraVez) {
        const randomIndex = Math.floor(Math.random() * canciones.length);
        loadSong(randomIndex);
        playSong();
        primeraVez = false;
    } else {
        if (audioPlayer.paused) {
            playSong();
        } else {
            pauseSong();
        }
    }
});


audioPlayer.addEventListener('timeupdate', function () {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    range.value = (currentTime / duration) * 100;
    document.querySelector('.start').textContent = formatTime(currentTime);
    document.querySelector('.end').textContent = formatTime(duration);
});


audioPlayer.addEventListener('ended', function () {
    // Verificar si han pasado dos minutos y no se ha mostrado el anuncio aún
    if (audioPlayer.currentTime >= playAdInterval && !hasPlayedAd) {
        playAd();
        hasPlayedAd = true; // Marcar el anuncio como reproducido para evitar que se repita
    }
    nextSong(); // Ir a la siguiente canción al finalizar la actual
});

const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return padTime(minutes) + ':' + padTime(seconds);
}

const padTime = (time) => {
    return (time < 10 ? '0' : '') + time;
}

nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", prevSong);

getData();