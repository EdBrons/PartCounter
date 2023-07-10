import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

export class App {
    constructor() {
        this.firstPoint = null;
        this.rects = []
    }
    initPixi() {
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

        let partsTexture = PIXI.Assets.load('images/1.JPG');
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
        });

        this.crosshairs = new PIXI.Graphics();
        this.crosshairs.lineStyle(6, 0x808080, .4);
        this.pixiApp.stage.addChild(this.crosshairs);


        this.viewport.on('mousemove', (e) => {
            if (this.mode == 'edit') {
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
            }
        });

        this.viewport.drag().pinch().wheel().decelerate().clamp({ direction: 'all' });

        this.enterEditMode();
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
        rect.lineStyle(2, 0xFF0000, .75);
        rect.drawRect(r.x, r.y, r.width, r.height);
        this.viewport.addChild(rect);
    }
    enterSelectionMode() {
        this.mode = 'selection';
    }
    enterEditMode() {
        this.mode = 'edit';
    }
    exitEditMode() {
        this.enterSelectionMode();
    }
}