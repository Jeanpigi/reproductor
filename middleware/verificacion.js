// Middleware para verificar la sesión del usuario
function verificarSesion(req, res, next) {
    if (req.session.user) {
        // El usuario tiene una sesión activa, permitir el acceso a la siguiente ruta
        next();
    } else {
        // El usuario no tiene una sesión activa, redirigir al inicio de sesión
        res.redirect('/login');
    }
}

module.exports = {
    verificarSesion
}
