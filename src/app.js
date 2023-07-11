import { Display } from './display.js';

export class App {
    constructor() {
        this.rects = []
        this.firstPoint = null;
        this.display = new Display();
        this.handleUploadForm();
    }
    handleUploadForm() {
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.getData(e).finally(
                result => {
                    console.log("Success.")
                },
                error => {
                    console.log("Failure.");
                }
            )
        });
    }
    async getData(e) {
        const formData = new FormData(e.target);
        const response = await fetch("/upload", {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        let rects = data["rects"]
        let filename = data["filename"]

        document.getElementById("upload").hidden = true
        document.getElementById("info").hidden = false

        this.display.init()
        this.display.displayParts(filename, rects)
    }
}