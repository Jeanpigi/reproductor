const actualizarFechaHora = () => {
  const footerText = document.getElementById("footer-text");
  const fechaHoraActual = new Date().toLocaleString();
  footerText.textContent = fechaHoraActual;
};

// Llamamos a la función para que se ejecute inmediatamente
actualizarFechaHora();

// Actualizamos la fecha y hora cada segundo
setInterval(actualizarFechaHora, 1000);
