const verificarSesion = (req, res, next) => {
    console.log('Middleware de verificación de sesión activado');
    console.log(req.session);

    if (!req.session.user) {
        // El usuario no tiene una sesión activa, permitir el acceso a la siguiente ruta
        next();
    } else {
        // El usuario tiene una sesión activa, redirigir al inicio de sesión
        res.redirect('/login');
    }
}

module.exports = {
    verificarSesion
}