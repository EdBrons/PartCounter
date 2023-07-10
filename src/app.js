import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

function randomColor() {
    return '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
}

export class App {
    constructor() {
        this.rects = []
        this.firstPoint = null;
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.getData(e).finally(
                result => {
                    console.log("Success.")
                },
                error => {
                    console.log("Couldn't upload that file.");
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
        let fn = data["filename"]

        document.getElementById("upload").hidden = true
        document.getElementById("info").hidden = false
        this.initPixi(fn, rects)
        document.getElementById("parts").innerHTML = "" + this.rects.length + " Parts."
    }
    initPixi(filename, rects) {
        this.pixiApp = new PIXI.Application({ resizeTo: window });
        document.body.appendChild(this.pixiApp.view);

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 10000,
            worldHeight: 10000,
            events: this.pixiApp.renderer.events,
        });

        this.pixiApp.stage.addChild(this.viewport);

        let partsTexture = PIXI.Assets.load(filename);
        partsTexture.then((texture) => {
            this.parts = new PIXI.Sprite(texture);
            this.parts.anchor.set(0, 0);
            this.viewport.addChild(this.parts);
            this.viewport.worldWidth = texture.width;
            this.viewport.worldHeight = texture.height;
            this.rectPlacement();

            this.newRect = new PIXI.Graphics();
            this.newRect.lineStyle(2, 0xFF0000, .75);
            this.viewport.addChild(this.newRect);

            rects.forEach(r => {
                let p1 = { x: r[0], y: r[1] };
                let p2 = { x: p1.x + r[2], y: p1.y + r[3] };
                this.addPartRect(p1, p2);
            });
        });

        this.crosshairs = new PIXI.Graphics();
        this.crosshairs.lineStyle(6, 0x808080, .4);
        this.pixiApp.stage.addChild(this.crosshairs);


        this.viewport.on('mousemove', (e) => {
            this.crosshairs.clear();

            this.crosshairs.lineStyle(6, 0x808080, .4);
            this.crosshairs.moveTo(e.global.x, 0);
            this.crosshairs.lineTo(e.global.x, window.innerHeight);
            this.crosshairs.moveTo(0, e.global.y);
            this.crosshairs.lineTo(window.innerWidth, e.global.y);

            if (this.firstPoint != null) {
                this.newRect.clear();
                let r = this.getRect(this.firstPoint, this.viewport.toWorld(e.clientX, e.clientY));
                this.newRect.lineStyle(2, 0xFF0000, .75);
                this.newRect.drawRect(r.x, r.y, r.width, r.height);
            }
        });

        this.viewport.drag().pinch().wheel().decelerate().clamp({ direction: 'all' });

    }
    rectPlacement() {
        this.clickDelta = 6;
        this.startX;
        this.startY;

        this.viewport.on('mousedown', (e) => {
            this.startX = e.clientX;
            this.startY = e.clientY;
        });

        this.viewport.on('mouseup', (e) => {
            const diffX = Math.abs(e.pageX - this.startX);
            const diffY = Math.abs(e.pageY - this.startY);

            if (diffX < this.clickDelta && diffY < this.clickDelta) {
                if (this.firstPoint == null) {
                    this.firstPoint = this.viewport.toWorld(e.clientX, e.clientY);
                }
                else {
                    let newPoint = this.viewport.toWorld(e.clientX, e.clientY);
                    this.addPartRect(this.firstPoint, newPoint);
                    this.firstPoint = null;
                }
            }
        });
    }
    getRect(p1, p2) {
        let tl = { x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) }
        let br = { x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y) }
        let width = br.x - tl.x
        let height = br.y - tl.y;
        return new PIXI.Rectangle(tl.x, tl.y, width, height);
    }
    addPartRect(p1, p2) {
        let r = this.getRect(p1, p2);
        let rect = new PIXI.Graphics();
        rect.lineStyle(4, randomColor());
        rect.beginFill(0x0000FF, .5);
        rect.drawRect(r.x, r.y, r.width, r.height);
        this.viewport.addChild(rect);

        this.rects.push(rect);
        document.getElementById("parts").innerHTML = "" + this.rects.length + " Parts."
    }
}