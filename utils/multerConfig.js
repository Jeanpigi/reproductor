const multer = require("multer");

// Función de almacenamiento para archivos de música
const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/music"),
  filename: (req, file, cb) => {
    // Guardar nombre de archivo
    cb(null, `${file.originalname}`);
  },
});

const adsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/audios"),
  filename: function (req, file, cb) {
    // Guardar el nombre de archivo
    cb(null, `${file.originalname}`);
  },
});

const musicUpload = multer({
  storage: musicStorage,
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ["mp3", "m4a"];
    const fileExtension = file.originalname.split(".").pop();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos MP3 y M4A."), false);
    }
  },
}).array("canciones", 150);

const adsUpload = multer({
  storage: adsStorage,
  fileFilter: function (req, file, cb) {
    // Restrict the allowed file types
    const fileExtension = file.originalname.split(".").pop();
    const allowedExtensions = ["mp3"];

    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Only MP3 files are allowed"), false);
    }
  },
}).array("audios", 50); // Permitir hasta 50 archivos de anuncios

module.exports = {
  musicUpload: musicUpload,
  adsUpload: adsUpload,
};
