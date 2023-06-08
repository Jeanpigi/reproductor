const playButton = document.getElementById('play-button');
const play = document.getElementById("play-btn");
const nextButton = document.getElementById('forward');
const prevButton = document.getElementById('backward');
const playerImage = document.getElementById('player-image');
const audioPlayer = document.getElementById('audio-player');
const titulo = document.getElementById("titulo");
const songs = document.getElementById("songs");
const range = document.getElementById('duration__range');

const urlCanciones = '/api/canciones';
const urlAnuncios = '/api/anuncios';

let canciones = [];
let anuncios = [];

let actualSong = null;
let isRotating = false;

// Contador de anuncios
let adCount = 0;

const getData = async () => {
    try {
        const response = await fetch(urlCanciones);
        const responseAds = await fetch(urlAnuncios);
        const data = await response.json();
        const ads = await responseAds.json();
        canciones = data;
        anuncios = ads;
        loadSongs();
    } catch (error) {
        console.error('Error:', error);
    }
}

const loadSongs = () => {
    canciones.forEach((song, index) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = song.filename;
        link.href = "#";
        link.addEventListener("click", () => loadSong(index));
        li.appendChild(link);
        songs.appendChild(li);
    });
}

const loadSong = (songIndex) => {
    if (songIndex !== actualSong) {
        changeActiveClass(actualSong, songIndex);
        actualSong = songIndex;
        audioPlayer.src = "/music/" + canciones[songIndex].filename;
        playSong();
        changeSongtitle(songIndex);
    }
}

// const loadSong = (songIndex) => {
//     if (songIndex !== actualSong) {
//         changeActiveClass(actualSong, songIndex);
//         actualSong = songIndex;
//         if (adCount === 1) {
//             playAd();
//             adCount = 0;
//         } else {
//             audioPlayer.src = "/music/" + canciones[songIndex].filename;
//             playSong();
//             adCount++;
//         }
//         changeSongtitle(songIndex);
//     }
// }


function playAd() {
    pauseSong(); // Pausa la canción actual
    const adIndex = Math.floor(Math.random() * anuncios.length); // Obtén un índice aleatorio para el anuncio
    const adUrl = "/publicidad/" + anuncios[adIndex].filename; // URL del anuncio
    const adDuration = anuncios[adIndex].duration; // Duración del anuncio en segundos

    // Cargar y reproducir el anuncio
    audioPlayer.src = adUrl;
    audioPlayer.play();

    // Esperar la duración del anuncio y reanudar la canción actual
    setTimeout(() => {
        playSong(); // Reanudar la canción
    }, adDuration * 1000);
}


const rotateImage = () => {
    playerImage.style.transform += 'rotate(1deg)';
    animationId = requestAnimationFrame(rotateImage);
};

const stopRotation = () => {
    cancelAnimationFrame(animationId);
};

function updateControls() {
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

function updateProgress(event) {
    const { duration, currentTime } = event.srcElement;
    const percent = (currentTime / duration) * 100;
    range.value = percent;
}

function setProgress(event) {
    const totalWidth = this.offsetWidth;
    const progressWidth = event.offsetX;
    const current = (progressWidth / totalWidth) * audioPlayer.duration;
    audioPlayer.currentTime = current;
}

function playSong() {
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

function pauseSong() {
    audioPlayer.pause();
    updateControls();
    stopRotation();
    isRotating = false;
}

function changeActiveClass(lastIndex, newIndex) {
    const links = document.querySelectorAll("#songs a");
    if (lastIndex !== null) {
        links[lastIndex].classList.remove("active");
    }
    links[newIndex].classList.add("active");
}

function changeSongtitle(songIndex) {
    titulo.innerText = canciones[songIndex].filename;
}

function prevSong() {
    if (actualSong > 0) {
        loadSong(actualSong - 1);
    } else {
        loadSong(canciones.length - 1);
    }
}

function nextSong() {
    if (actualSong < canciones.length - 1) {
        loadSong(actualSong + 1);
    } else {
        loadSong(0);
    }
}

audioPlayer.addEventListener("ended", nextSong);
playButton.addEventListener("click", () => {
    if (audioPlayer.paused) {
        if (audioPlayer.currentTime > 0) {
            playSong();
        } else {
            loadSong(0);
            playSong();
        }
    } else {
        pauseSong();
    }
});

audioPlayer.addEventListener('timeupdate', function () {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    range.value = (currentTime / duration) * 100;
    document.querySelector('.start').textContent = formatTime(currentTime);
    document.querySelector('.end').textContent = formatTime(duration);
});

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return padTime(minutes) + ':' + padTime(seconds);
}

function padTime(time) {
    return (time < 10 ? '0' : '') + time;
}

nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", prevSong);

getData();