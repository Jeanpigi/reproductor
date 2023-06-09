const express = require('express');
const router = express.Router();

const { signup, login, getAllSongs, getAllAds, insertAds, insertSong } = require('../controllers/indexController');
const { adsUpload, musicUpload } = require('../utils/multerConfig');

//Middlewares
const { controlInactividad } = require('../middleware/inactividad');
const { verificarSesion } = require('../middleware/verificacion');

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
router.get('/canciones', verificarSesion, (req, res) => {
    // Verificar si el usuario ha iniciado sesión
    if (req.session.user) {
        res.render('songs');
    } else {
        res.redirect('/login');
    }
}, controlInactividad);

router.post('/canciones', musicUpload.single('cancion'), insertSong);


//Ruta de los dashboard de los anuncios
router.get('/anuncios', verificarSesion, (req, res) => {
    // Verificar si el usuario ha iniciado sesión
    if (req.session.user) {
        res.render('ads');
    } else {
        res.redirect('/login');
    }
}, controlInactividad);

router.post('/anuncios', adsUpload.single('anuncios'), insertAds);

//Apis
router.get("/api/canciones", getAllSongs);
router.get("/api/anuncios", getAllAds);

//Ruta para el logout 
router.get('/logout', (req, res) => {
    // Destruir la sesión y redirigir al inicio de sesión
    req.session.destroy();
    res.redirect('/login');
});



// Ruta de manejo de errores 404
router.use((req, res) => {
    res.status(404).render('404', { mensaje: 'Pagina no encontrada' });
});

module.exports = router;