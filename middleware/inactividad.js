// Middleware de control de inactividad y cierre de sesión automático
function controlInactividad(req, res, next) {
  // Reiniciar el temporizador de sesión cuando se detecte actividad
  req.session.touch();

  // Establecer el temporizador para cerrar la sesión después de 10 minutos de inactividad
  const tiempoInactividad = 600000; // 10 minutos en milisegundos

  if (req.session.temporizador) {
    clearTimeout(req.session.temporizador);
  }

  req.session.temporizador = setTimeout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar la sesión:", err);
        return res
          .status(500)
          .send("Error al cerrar la sesión automáticamente.");
      } else {
        console.log(
          "La sesión se cerró automáticamente debido a la inactividad."
        );
        // Redirigir al usuario a la página de inicio de sesión
        return res.redirect("/login");
      }
    });
  }, tiempoInactividad);

  next();
}

module.exports = {
  controlInactividad,
};
