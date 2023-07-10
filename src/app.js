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
            // not sure what to set these values to
            worldWidth: 10000,
            worldHeight: 10000,

            events: this.pixiApp.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        });

        this.pixiApp.stage.addChild(this.viewport);
        this.parts = null;

        const partsTexture = PIXI.Assets.load('images/1.JPG');

        partsTexture.then((texture) => {
            this.parts = new PIXI.Sprite(texture);
            this.parts.anchor.set(0, 0);
            this.viewport.addChild(this.parts);
            this.viewport.worldWidth = texture.width;
            this.viewport.worldHeight = texture.height;

            this.rectPlacement();
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
            }
        });

        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()
            .clamp({ direction: 'all' });

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
                    if (newPoint.x < this.firstPoint.x && newPoint.y < this.firstPoint.y) {
                        let temp = { x: newPoint.x, y: newPoint.y }
                        newPoint = this.firstPoint
                        this.firstPoint = temp
                    }
                    let rect = new PIXI.Graphics();
                    rect.lineStyle(5, 0xFF0000);
                    rect.drawRect(this.firstPoint.x, this.firstPoint.y, newPoint.x - this.firstPoint.x, newPoint.y - this.firstPoint.y)
                    this.viewport.addChild(rect);
                    this.firstPoint = null;
                }
            }
        });
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