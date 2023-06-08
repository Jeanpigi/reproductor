const express = require('express');
const router = express.Router();

const { signup, login, getAllSongs, getAllAds, insertAds, insertSong } = require('../controllers/indexController');
const { adsUpload, musicUpload } = require('../utils/multerConfig');

//Ruta principal
router.get('/', (req, res) => {
    res.render('player');
});

// Ruta de login y register user
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', login);

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', signup);

//Rutas de las canciones
router.get('/canciones', (req, res) => {
    res.render('songs');
});

router.post('/canciones', musicUpload.single('cancion'), insertSong);


//Ruta de los dashboard de los anuncios
router.get('/anuncios', (req, res) => {
    res.render('ads');
});

router.post('/anuncios', adsUpload.single('anuncios'), insertAds);

//Apis
router.get("/api/canciones", getAllSongs);
router.get("/api/anuncios", getAllAds);


// Ruta de manejo de errores 404
router.use((req, res) => {
    res.status(404).render('404', { mensaje: 'Pagina no encontrada' });
});

module.exports = router;