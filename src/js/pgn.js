const importPgn = 

document.addEventListener('DOMContentLoaded', () =>{
    const uploadPgn = document.getElementById('upload-pgn');
    uploadPgn.addEventListener('change', () => importPgn(uploadPgn.files[0]));
});