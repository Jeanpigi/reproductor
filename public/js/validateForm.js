const validateForm = () => {
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;

  if (username === "" || password === "") {
    alert("Por favor, completa todos los campos.");
    return false;
  }

  return true;
};
