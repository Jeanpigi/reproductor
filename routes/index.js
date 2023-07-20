const express = require('express');
const router = express.Router();

const { signup,
    login,
    canciones,
    getAll,
    anuncios,
    deleteSong,
    insertAudios,
    insertSong,
    deleteAudios
} = require('../controllers/indexController');

const {
    adsUpload,
    musicUpload,
} = require('../utils/multerConfig');

// Middlewares
const { controlInactividad } = require('../middleware/inactividad');
const { verificarSesion } = require('../middleware/verificacion');

// Ruta principal
router.get('/', (req, res) => {
    res.render('player');
});

// Ruta de Admin
router.get('/stream', (req, res) => {
    res.render('stream', { layout: false });
});

// Ruta de registro y inicio de sesión de usuario
router.get('/signup', verificarSesion, (req, res) => {
    res.render('signup');
});

router.post('/signup', verificarSesion, signup);

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', login);

// Rutas de canciones
router.get('/canciones', verificarSesion, getAll, controlInactividad);

router.post('/canciones', verificarSesion, musicUpload, insertSong, controlInactividad);

router.post('/canciones/:id', verificarSesion, deleteSong, controlInactividad);

// Rutas del panel de anuncios
router.post('/audios', verificarSesion, adsUpload, insertAudios, controlInactividad);

router.post('/audios/:id', verificarSesion, deleteAudios, controlInactividad);

// APIs
router.get("/api/canciones", canciones);
router.get("/api/anuncios", anuncios);

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