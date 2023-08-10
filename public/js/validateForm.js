function validateForm() {
    var username = document.getElementById("usernameInput").value;
    var password = document.getElementById("passwordInput").value;

    if (username === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return false; // Evita que se envíe el formulario
    }
}