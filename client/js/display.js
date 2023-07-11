import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

function randomColor() {
    return '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
}

function getRect(p1, p2) {
    let tl = { x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) }
    let br = { x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y) }
    let width = br.x - tl.x
    let height = br.y - tl.y;
    return new PIXI.Rectangle(tl.x, tl.y, width, height);
}

export class Display {
    constructor() {
        this.app = null;
        this.modes = ['select', 'place']
    }
    init() {
        this.app = new PIXI.Application({ resizeTo: window });
        document.body.appendChild(this.app.view);
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 10000,
            worldHeight: 10000,
            events: this.app.renderer.events,
        });
        this.app.stage.addChild(this.viewport);
    }
    displayParts(filename, rects) {
        let partsTexture = PIXI.Assets.load(filename);
        partsTexture.then((texture) => {
            this.parts = new PIXI.Sprite(texture);
            this.parts.anchor.set(0, 0);
            this.parts.interactive = false;
            this.viewport.addChild(this.parts);

            this.rects = new PIXI.Container()
            this.viewport.addChild(this.rects)

            this.viewport.worldWidth = texture.width;
            this.viewport.worldHeight = texture.height;

            this.makeCrosshairs();
            this.makePlacementRect();

            rects.forEach(r => {
                let p1 = { x: r[0], y: r[1] };
                let p2 = { x: p1.x + r[2], y: p1.y + r[3] };
                this.addPartRect(p1, p2);
            });

            this.handleInput();
            this.setModeSelect();
        });
    }
    makeCrosshairs() {
        this.crosshairs = new PIXI.Graphics();
        this.crosshairs.lineStyle(6, 0x808080, .4);
        this.app.stage.addChild(this.crosshairs);
    }
    makePlacementRect() {
        this.newRect = new PIXI.Graphics();
        this.newRect.lineStyle(2, 0xFF0000, .75);
        this.viewport.addChild(this.newRect);
    }
    handleInput() {
        this.viewport.on('mousemove', (e) => {
            if (this.mode == 'select') {

            }
            else if (this.mode == 'place') {
                this.crosshairs.clear();

                this.crosshairs.lineStyle(6, 0x808080, .4);
                this.crosshairs.moveTo(e.global.x, 0);
                this.crosshairs.lineTo(e.global.x, window.innerHeight);
                this.crosshairs.moveTo(0, e.global.y);
                this.crosshairs.lineTo(window.innerWidth, e.global.y);

                this.newRect.clear();
                if (this.firstPoint != null) {
                    let r = getRect(this.firstPoint, this.viewport.toWorld(e.clientX, e.clientY));
                    this.newRect.lineStyle(2, 0xFF0000, .75);
                    this.newRect.drawRect(r.x, r.y, r.width, r.height);
                }
            }
        });

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
                this.handleClick(e);
            }
        });

        this.viewport.on('rightdown', (e) => {
            e.preventDefault();
            if (this.mode == 'place') {
                this.clearPlacement();
            }
        })

        document.addEventListener('keydown', (e) => {
            if (this.mode == 'place') {
                this.clearPlacement();
            }

            if (e.key == 'x') {
                if (this.mode == 'select' && this.selectedRect != null) {
                    // delete
                    this.deleteRect(this.selectedRect);
                }
            }
            else if (e.key == 's') {
                this.setModeSelect();
            }
            else if (e.key == 'p') {
                this.setModePlace();
            }
        })

        this.viewport.drag().pinch().wheel().decelerate().clamp({ direction: 'all' });
    }
    handleClick(e) {
        if (this.mode == 'select') {
        }
        else if (this.mode == 'place') {
            if (this.firstPoint == null) {
                this.firstPoint = this.viewport.toWorld(e.clientX, e.clientY);
            }
            else {
                let newPoint = this.viewport.toWorld(e.clientX, e.clientY);
                this.addPartRect(this.firstPoint, newPoint);
                this.clearPlacement();
            }
        }
    }
    clearPlacement() {
        this.firstPoint = null;
        this.newRect.clear();
    }
    setModeSelect() {
        this.crosshairs.visible = false;
        this.newRect.visible = false;
        this.clearPlacement();

        this.mode = 'select';
        this.rects.interactive = true;
        this.rects.cursor = 'pointer';
    }
    setModePlace() {
        this.crosshairs.visible = true;
        this.newRect.visible = true;

        this.clearPlacement();

        this.selectRect(null);
        this.mode = 'place';
        this.rects.interactive = false;
        this.rects.cursor = 'default';
    }
    addPartRect(p1, p2) {
        let r = getRect(p1, p2);
        let rect = new PIXI.Graphics();

        rect.beginFill(0xffffff, .5);
        rect.lineStyle(4, 0x000000);
        rect.drawRect(0, 0, r.width, r.height);
        rect.tint = 0x0000ff;
        rect.endFill();
        rect.position.set(r.x, r.y);

        this.rects.addChild(rect);
        rect.interactive = true;

        rect.onclick = (e) => {
            if (this.mode == 'select') {
                this.selectRect(rect);
            }
        }

        document.getElementById("parts").innerHTML = this.rects.children.length
    }
    selectRect(r) {
        if (this.selectedRect != null) {
            this.selectedRect.tint = 0x0000ff;
        }
        if (r != null) {
            r.tint = 0x00ff00;
        }
        this.selectedRect = r;
    }
    deleteRect(r) {
        if (r != null) {
            this.rects.removeChild(r)
            if (this.selectedRect == r) {
                this.selectRect(null);
            }
        }

        document.getElementById("parts").innerHTML = this.rects.children.length
    }
}