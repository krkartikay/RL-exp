import * as PIXI from "pixi.js";
import "./index.scss";
import Chart from 'chart.js';

import Environment from "./environment";
import RandomAgent from "./randomAgent";

let pixiapp;

function main() {
    pixiapp = new PIXI.Application({ width: 400, height: 300 });
    document.querySelector("#pixiapp").appendChild(pixiapp.view);
    setRunState(0); // stop
    reset();
    runWorld();
}

function worldTick() {
    const obs = env.getObservation();
    const actions = env.getActions();
    const act = agt.chooseAction(obs, actions);
    const reward = env.performAction(act);
    agt.reward(reward);
}

function runWorld() {
    switch (runState) {
        case 0: // stop
            break;
        case 1: // run normal
            worldTick();
            env.display();
            agt.display();
            break;
        case 2: // run fast forward
            for (let i = 0; i < 10; i++) worldTick();
            env.display();
            agt.display();
            break;
    }
    requestAnimationFrame(runWorld);
}

window.setRunState = function (s) {
    const buttons = ['stpbutton', 'runbutton', 'ffwbutton'];
    for (const id of buttons) {
        document.querySelector("#" + id).className = "button is-small is-inline";
    }
    document.querySelector("#" + buttons[s]).className += " is-info is-selected";
    window.runState = s;
}

window.reset = function () {
    window.env = new Environment(pixiapp);
    window.agt = new RandomAgent(pixiapp);
    // window.graph1 = new Chart(ctx, );
}

window.onload = main;