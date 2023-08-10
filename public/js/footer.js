function actualizarFechaHora() {
    const fechaHoraActual = new Date().toLocaleString();
    const footerText = document.getElementById('footer-text');
    footerText.textContent = fechaHoraActual;
}

// Llamamos a la función para que se ejecute inmediatamente
actualizarFechaHora();

// Actualizamos la fecha y hora cada segundo
setInterval(actualizarFechaHora, 1000);