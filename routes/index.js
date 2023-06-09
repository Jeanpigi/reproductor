const express = require('express');
const router = express.Router();

const { signup, login, getAllSongs, getAll, getAllAds, deleteSong, insertAds, insertSong, deleteAds } = require('../controllers/indexController');
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
router.get('/canciones', verificarSesion, getAll, controlInactividad);

router.post('/canciones', verificarSesion, musicUpload.single('cancion'), insertSong, controlInactividad);

router.post('/canciones/:id', deleteSong);


//Ruta de los dashboard de los anuncios
// router.get('/anuncios', verificarSesion, getAllAnuncios, controlInactividad);

router.post('/anuncios', verificarSesion, adsUpload.single('anuncios'), insertAds, controlInactividad);

router.post('/anuncios/:id', deleteAds);

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