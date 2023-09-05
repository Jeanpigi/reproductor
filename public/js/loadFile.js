const fileTypeSelect = document.getElementById("fileTypeSelect");
const filePathInput = document.getElementById("filePath");
const uploadForm = document.getElementById("uploadForm");
const uploadLabel = document.querySelector(".upload-label");
const uploadButton = document.getElementById("uploadButton");

const enableUploadButton = () => {
  if (fileTypeSelect.value !== "") {
    uploadButton.disabled = !filePathInput.files.length;
  } else {
    showAlert();
  }
};

const changeFormAction = (selectedOption) => {
  const actions = {
    cancion: {
      action: "/canciones",
      name: "canciones",
      for: "canciones",
    },
    anuncio: {
      action: "/audios",
      name: "audios",
      for: "audios",
    },
  };

  const { action, name, for: htmlFor } = actions[selectedOption];

  uploadForm.action = action;
  filePathInput.name = name;
  uploadLabel.setAttribute("for", htmlFor);
};

fileTypeSelect.addEventListener("change", () => {
  const selectedFileType = fileTypeSelect.value;
  if (selectedFileType === "canciones") {
    fileInputLabel.textContent = "Selecciona la canción:";
    filePathInput.placeholder = "Archivo de canción";
  } else if (selectedFileType === "anuncios") {
    fileInputLabel.textContent = "Selecciona el anuncio:";
    filePathInput.placeholder = "Archivo de anuncio";
  }
});

// Mostrar una alerta de SweetAlert2
const showAlert = () => {
  Swal.fire({
    title: "Oops...",
    text: "Debes seleccionar una canción o anuncio",
    icon: "error",
    confirmButtonText: "Aceptar",
  }).then(() => {
    // Limpiar el archivo seleccionado actualmente
    filePathInput.value = "";
  });
};
