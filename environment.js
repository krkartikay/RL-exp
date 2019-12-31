import { Graphics, Application } from "pixi.js";

const HEIGHT = 300;
const WIDTH = 400;

const GRIDH = 15;
const GRIDW = 20;

const SQH = (HEIGHT-1)/GRIDH; // these both should
const SQW = (WIDTH-2)/GRIDW; // be about the same

export default
class Environment {

    constructor(pixiapp) {
        this.pixiapp = pixiapp;
        this.agent_X = 0;
        this.agent_Y = 0;
        this.target_X = 19;
        this.target_Y = 14;
        this.initGraphics();
        this.display();
    }

    getObservation() {

    }

    getActions() {

    }

    performAction() {
        
    }

    initGraphics() {
        // make grid background
        const background = new Graphics();
        background.beginFill(0xffffff);
        background.drawRect(0, 0, WIDTH, HEIGHT);
        background.endFill();
        background.lineStyle(1, 0x000000, 1);
        for (let i = 1; i <= WIDTH; i += SQH) {
            background.moveTo(i, 0);
            background.lineTo(i, HEIGHT);
        }
        for (let i = 1; i <= HEIGHT; i += SQW) {
            background.moveTo(0, i);
            background.lineTo(WIDTH, i);
        }
        this.pixiapp.stage.addChild(background);

        // make an agent
        this.agent = new Graphics();
        this.agent.lineStyle(1, 0x000000, 1);
        this.agent.beginFill(0xFF00FF);
        this.agent.drawCircle(SQH/2, SQW/2, Math.min(SQH, SQW)/2.1);
        this.pixiapp.stage.addChild(this.agent);
        
        // make an target
        this.target = new Graphics();
        this.target.lineStyle(1, 0x000000, 1);
        this.target.beginFill(0xFFFF00);
        this.target.drawStar(SQW/2, SQH/2, 5, Math.min(SQH, SQW)/2.1);
        this.pixiapp.stage.addChild(this.target);
    }


    display(){
        this.agent.x = SQW * this.agent_X;
        this.agent.y = SQH * this.agent_Y;
        this.target.x = SQW * this.target_X;
        this.target.y = SQH * this.target_Y;
    }

}