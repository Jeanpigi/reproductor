const express = require("express");
const router = express.Router();

// Ruta principal
router.get("/player", (req, res) => {
  res.render("player");
});

module.exports = router;
