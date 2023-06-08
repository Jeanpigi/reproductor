function enableUploadButton() {
    let fileInput = document.getElementById("filePath");
    let uploadButton = document.getElementById("uploadButton");

    if (fileInput.files.length > 0) {
        uploadButton.disabled = false;
    } else {
        uploadButton.disabled = true;
    }
};