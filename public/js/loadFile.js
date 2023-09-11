const elements = {
  fileTypeSelect: document.getElementById("fileTypeSelect"),
  filePathInput: document.getElementById("filePath"),
  uploadForm: document.getElementById("uploadForm"),
  uploadLabel: document.querySelector(".upload-label"),
  uploadButton: document.getElementById("uploadButton"),
};

const actions = {
  cancion: {
    action: "/canciones",
    name: "canciones",
    label: "Selecciona la canción:",
    placeholder: "Archivo de canción",
  },
  anuncio: {
    action: "/audios",
    name: "audios",
    label: "Selecciona el anuncio:",
    placeholder: "Archivo de anuncio",
  },
};

const enableUploadButton = () => {
  const { fileTypeSelect, filePathInput, uploadButton } = elements;
  const selectedOption = fileTypeSelect.value;

  if (selectedOption) {
    uploadButton.disabled = !filePathInput.files.length;
  } else {
    showAlert();
  }
};

const changeFormAction = (selectedOption) => {
  const { uploadForm, filePathInput, uploadLabel } = elements;
  const { action, name, label, placeholder } = actions[selectedOption];

  uploadForm.action = action;
  filePathInput.name = name;
  uploadLabel.textContent = label;
  filePathInput.placeholder = placeholder;
};

elements.fileTypeSelect.addEventListener("change", () => {
  const selectedOption = elements.fileTypeSelect.value;
  if (selectedOption in actions) {
    changeFormAction(selectedOption);
  }
});

const showAlert = () => {
  Swal.fire({
    title: "Oops...",
    text: "Debes seleccionar una canción o anuncio",
    icon: "error",
    confirmButtonText: "Aceptar",
  }).then(() => {
    elements.filePathInput.value = "";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      const keysToRemove = ["playlist"];
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    });
  }
});
