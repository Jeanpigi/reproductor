const express = require('express');
const router = express.Router();

const { signup, login, getAllSongs, getAll, getAllAudios, deleteSong, insertAudios, insertSong, deleteAudios } = require('../controllers/indexController');
const { adsUpload, musicUpload } = require('../utils/multerConfig');

// Middlewares
const { controlInactividad } = require('../middleware/inactividad');
const { verificarSesion } = require('../middleware/verificacion');

// Ruta principal
router.get('/', (req, res) => {
    res.render('player');
});

// Ruta de registro y inicio de sesión de usuario
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', signup);

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', login);

// Rutas de canciones
router.get('/canciones', getAll, controlInactividad);

router.post('/canciones', musicUpload, insertSong, controlInactividad);

router.post('/canciones/:id', deleteSong);

// Rutas del panel de anuncios
router.post('/audios', adsUpload, insertAudios, controlInactividad);

router.post('/audios/:id', deleteAudios);

// APIs
router.get("/api/canciones", getAllSongs);
router.get("/api/anuncios", getAllAudios);

// Ruta para el cierre de sesión
router.get('/logout', (req, res) => {
    // Destruir la sesión y redirigir a la página de inicio de sesión
    req.session.destroy();
    res.redirect('/login');
});

// Ruta de manejo de errores 404
router.use((req, res) => {
    res.status(404).render('404', { mensaje: 'Página no encontrada' });
});

module.exports = router;