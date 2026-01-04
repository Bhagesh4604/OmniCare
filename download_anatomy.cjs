
const https = require('https');
const fs = require('fs');
const path = require('path');

// Trying a different source that might be a full human model
const url = "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb";
const dest = path.join(__dirname, 'public', 'HumanAnatomy.glb');

const file = fs.createWriteStream(dest);
console.log("Downloading HumanAnatomy.glb...");

https.get(url, function (response) {
    if (response.statusCode !== 200) {
        console.error(`Download failed: HTTP ${response.statusCode}`);
        return;
    }
    const len = parseInt(response.headers['content-length'], 10);
    let downloaded = 0;

    response.pipe(file);
    response.on('data', (chunk) => {
        downloaded += chunk.length;
        // console.log(`Downloaded ${((downloaded / len) * 100).toFixed(2)}%`);
    });

    file.on('finish', function () {
        file.close(() => console.log("Download completed: public/HumanAnatomy.glb"));
    });
}).on('error', function (err) {
    fs.unlink(dest, () => { });
    console.error(`Error: ${err.message}`);
});
