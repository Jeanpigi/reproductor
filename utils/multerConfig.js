const multer = require('multer');

// Función de almacenamiento para archivos de música
const musicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/music');
    },
    filename: function (req, file, cb) {
        // Guardar nombre de archivo
        cb(null, `${file.originalname}`);
    }
});

// Función de almacenamiento para archivos de anuncios
const adsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/publicidad');
    },
    filename: function (req, file, cb) {
        // Guardar el nombre de archivo
        cb(null, `${file.originalname}`);
    }
});

// Configuración de Multer para archivos de música
const musicUpload = multer({
    storage: musicStorage,
    fileFilter: function (req, file, cb) {
        // Restringir los tipos de archivo permitidos
        const fileExtension = file.originalname.split('.').pop();
        if (fileExtension === 'mp3' || fileExtension === 'm4a') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos MP3 y M4A.'), false);
        }
    }
}).array('canciones', 10); // Permitir hasta 10 archivos de música

// Configuración de Multer para archivos de anuncios
const adsUpload = multer({
    storage: adsStorage,
    fileFilter: function (req, file, cb) {
        // Restringir los tipos de archivo permitidos
        const fileExtension = file.originalname.split('.').pop();
        if (fileExtension === 'mp3') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos MP3'), false);
        }
    }
}).array('anuncios', 10); // Permitir hasta 10 archivos de anuncios

module.exports = {
    musicUpload: musicUpload,
    adsUpload: adsUpload
};
