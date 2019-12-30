import * as PIXI from "pixi.js";
import "./index.scss";

import Environment from "./environment";
import RandomAgent from "./randomAgent";

function main() {
    const pixiapp = new PIXI.Application({ width: 256, height: 256 });
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
            break;
        case 2: // run fast forward
            for (let i = 0; i < 10; i++) worldTick();
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
    window.env = new Environment();
    window.agt = new RandomAgent();
}

window.onload = main;