const enableUploadButton = () => {
  const fileInput = document.getElementById("filePath");
  const uploadButton = document.getElementById("uploadButton");

  uploadButton.disabled = fileInput.files.length === 0;
};

const changeFormAction = (selectedOption) => {
  const uploadForm = document.getElementById("uploadForm");
  const filePathInput = document.getElementById("filePath");
  const uploadLabel = document.querySelector(".upload-label");

  switch (selectedOption) {
    case "cancion":
      uploadForm.action = "/canciones";
      filePathInput.name = "canciones";
      uploadLabel.setAttribute("for", "canciones");
      break;
    case "anuncio":
      uploadForm.action = "/audios";
      filePathInput.name = "audios";
      uploadLabel.setAttribute("for", "audios");
      break;
  }
};

const fileTypeSelect = document.getElementById("fileTypeSelect");
const filePathInput = document.getElementById("filePath");

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
