function confirmDelete(event) {
    event.preventDefault(); // Evita el envío del formulario de inmediato

    if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
        event.target.closest('form').submit(); // Envía el formulario para realizar la eliminación
    }
}
