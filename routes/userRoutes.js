const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/userController");
// Middlewares
const { controlInactividad } = require("../middleware/inactividad");
const { verificarSesion } = require("../middleware/verificacion");

// Ruta de registro y inicio de sesión de usuario
router.get("/signup", verificarSesion, (req, res) => {
  res.render("signup");
});

router.post("/signup", verificarSesion, signup);

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", login);

// Ruta para el cierre de sesión
router.get("/logout", (req, res) => {
  // Elimina la cookie que almacena el token JWT
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
