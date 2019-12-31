import * as PIXI from "pixi.js";
import "./index.scss";
import Chart from 'chart.js';

import Environment from "./environment";
import RandomAgent from "./randomAgent";
import AverageValue from "./averages";

let pixiapp;

function main() {
    pixiapp = new PIXI.Application({ width: 400, height: 300 });
    document.querySelector("#pixiapp").appendChild(pixiapp.view);
    reset();
    runWorld();
}

let episodes = 1;
let totreward = 0;

const avg_rew = new AverageValue(10);
const avg_iter = new AverageValue(10);

function worldTick() {
    if (env.terminated){
        graph1.data.datasets[0].data.push({ x: episodes - 1, y: env.iterations });
        graph1.data.datasets[1].data.push({ x: episodes - 1, y: avg_iter.value });
        graph1.update();
        graph2.data.datasets[0].data.push({ x: episodes - 1, y: totreward });
        graph2.data.datasets[1].data.push({ x: episodes - 1, y: avg_rew.value });
        graph2.update();
        avg_iter.update(env.iterations);
        avg_rew.update(totreward);
        totreward = 0;
        episodes += 1;
        setStatus(`Episode ${episodes}, avg. reward: ${Math.round(avg_rew.value * 100)/100},
                    avg. iterations per ep.: ${Math.round(avg_iter.value * 100)/100}`);
        env.reset();
    } else {
        const obs = env.getObservation();
        const actions = env.getActions();
        const act = agt.chooseAction(obs, actions);
        const reward = env.performAction(act);
        totreward += reward;
        agt.reward(reward);
    }
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

window.setStatus = function (text) {
    document.querySelector("#status").textContent = text;
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
    setRunState(0); // stop
    episodes = 1;
    setStatus(`Episode ${episodes}`);
    window.env = new Environment(pixiapp);
    window.agt = new RandomAgent(pixiapp);
    window.graph1 = new Chart('iter_ep', {
        type: "scatter",
        title: {
            display: true,
            text: 'Iter per Ep'
        },
        data: {
            datasets: [{
                showLine: true,
                label: '',
                data: [],
                backgroundColor: "#ffdddd88"
            }, {
                showLine: true,
                label: 'Iter/Ep',
                data: [],
            }],
        },
    });
    window.graph2 = new Chart('rew_ep', {
        type: "scatter",
        title: {
            display: true,
            text: 'Reward/Ep'
        },
        data: {
            datasets: [{
                showLine: true,
                label: '',
                data: [],
                backgroundColor: "#ffdddd88",
            },{
                showLine: true,
                label: 'Reward per Ep',
                data: [],
            }],
        },
    });
}

window.onload = main;