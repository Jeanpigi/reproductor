function enableUploadButton() {
    let fileInput = document.getElementById("filePath");
    let uploadButton = document.getElementById("uploadButton");

    if (fileInput.files.length > 0) {
        uploadButton.disabled = false;
    } else {
        uploadButton.disabled = true;
    }
};

function changeFormAction(selectedOption) {
    const uploadForm = document.getElementById('uploadForm');
    const filePathInput = document.getElementById('filePath');
    const uploadLabel = document.querySelector('.upload-label');

    if (selectedOption === 'cancion') {
        uploadForm.action = '/canciones';
        filePathInput.name = 'canciones';
        uploadLabel.setAttribute('for', 'canciones');
    } else if (selectedOption === 'anuncio') {
        uploadForm.action = '/audios';
        filePathInput.name = 'audios';
        uploadLabel.setAttribute('for', 'audios');
    }
}

const fileTypeSelect = document.getElementById('fileTypeSelect');
const filePathInput = document.getElementById('filePath');

fileTypeSelect.addEventListener('change', () => {
    const selectedFileType = fileTypeSelect.value;
    if (selectedFileType === 'canciones') {
        fileInputLabel.textContent = 'Selecciona la canción:';
        filePathInput.placeholder = 'Archivo de canción';
    } else if (selectedFileType === 'anuncios') {
        fileInputLabel.textContent = 'Selecciona el anuncio:';
        filePathInput.placeholder = 'Archivo de anuncio';
    }
});
