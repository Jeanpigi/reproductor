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
        filePathInput.name = 'cancion';
        uploadLabel.setAttribute('for', 'cancion');
    } else if (selectedOption === 'anuncio') {
        uploadForm.action = '/anuncios';
        filePathInput.name = 'anuncios';
        uploadLabel.setAttribute('for', 'anuncios');
    }
}
