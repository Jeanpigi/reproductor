const express = require("express");
const router = express.Router();

// Middlewares
const { verificarSesion } = require("../middleware/verificacion");

// Ruta principal
router.get("/player", verificarSesion, (req, res) => {
  res.render("player");
});

module.exports = router;
