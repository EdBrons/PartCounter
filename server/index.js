const express = require('express');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const findRemoveSync = require('find-remove');

const app = express();
const upload = multer({ dest: 'public/uploads/' });

app.use("/public", express.static(path.resolve(__dirname + '/../public')));
app.use("/", express.static(path.resolve(__dirname + '/../dist')));
// app.use("/", express.static(__dirname + '../dist'));

const port = 8080;

// helper function to run the python script with fn being the filename to input
let runPy = (fn) => new Promise(function (success, nosuccess) {
    const { spawn } = require('child_process');
    console.log(path.resolve(__dirname + '/../venv/bin/python'));
    const pyprog = spawn(path.resolve(__dirname + '/../venv/bin/python'), ['server/main.py', fn]);

    pyprog.stdout.on('data', function (data) {
        success(data);
    });

    pyprog.stderr.on('data', (data) => {
        nosuccess(data);
    });
});

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../dist/index.html'));
});

app.post('/upload', upload.single('image'), async (req, res) => {

    console.log(path.resolve(__dirname + '/../public/uploads'))
    const result = findRemoveSync(path.resolve(__dirname + '/../public/uploads'), { age: { seconds: 10 } });
    for (let filename in result) {
        if (result[filename]) {
            console.log('Removed file ' + filename + ' reason: old.')
        }
    }

    console.log('Received an upload.')
    if (req.file) {
        const originalPath = req.file.path;
        const targetPath = `${req.file.destination}${req.file.filename}.jpg`;

        // Rename and convert the file to JPG
        fs.rename(originalPath, targetPath, err => {
            if (err) {
                console.error('Error renaming the file:', err);
                res.status(500).send('Error renaming the file.');
            } else {
                console.log('File uploaded and converted to JPG.');
                console.log('File path:', targetPath);
            }
        });

        runPy(targetPath).then(
            result => {
                console.log('Image processed successfully.')
                var json_file = require(path.resolve(__dirname + '/../' + targetPath.split('.')[0] + '.json'))
                res.json(json_file)
            },
            error => {
                console.log(error.toString())
                res.status(500).send('Error processing image.')
            }
        )
    } else {
        console.log('No file uploaded.');
        res.send('No file uploaded!');
    }

});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});