
const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RiggedFigure/glTF-Binary/RiggedFigure.glb";
const dest = path.join(__dirname, 'public', 'RiggedFigure.glb');

// Ensure public dir exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

const file = fs.createWriteStream(dest);
https.get(url, function (response) {
    if (response.statusCode !== 200) {
        console.error(`Download failed: HTTP ${response.statusCode}`);
        return;
    }
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => console.log("Download completed: public/RiggedFigure.glb"));
    });
}).on('error', function (err) {
    fs.unlink(dest, () => { }); // Delete the file async. (But we don't check the result)
    console.error(`Error: ${err.message}`);
});
