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
                console.log("Error al cerrar la sesión:", err);
            } else {
                console.log("La sesión se cerró automáticamente debido a la inactividad.");
            }
        });
    }, tiempoInactividad);

    next();
}

module.exports = {
    controlInactividad
};


