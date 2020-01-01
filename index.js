import * as PIXI from "pixi.js";
import "./index.scss";
import Chart from 'chart.js';

import * as Environments from "./environments";
import * as Agents from "./agents";
import AverageValue from "./averages";

let pixiapp;

function main() {
    let width = Math.min(600, 0.8*window.innerWidth);
    let height = width*3/4;
    pixiapp = new PIXI.Application({ width: width, height: height });
    pixiapp.stop();
    document.querySelector("#pixiapp").appendChild(pixiapp.view);
    reset();
    runWorld();
}

let episodes = 1;
let totreward = 0;

let avg_rew;
let avg_iter;

async function worldTick() {
    if (env.terminated){
        avg_iter.update(env.iterations);
        avg_rew.update(totreward);
        graph1.data.datasets[0].data.push({ x: episodes - 1, y: env.iterations });
        graph1.data.datasets[1].data.push({ x: episodes - 1, y: avg_iter.value });
        graph2.data.datasets[0].data.push({ x: episodes - 1, y: totreward });
        graph2.data.datasets[1].data.push({ x: episodes - 1, y: avg_rew.value });
       
        totreward = 0;
        episodes += 1;
        setStatus(`Episode ${episodes}, avg. reward: ${Math.round(avg_rew.value * 100)/100},
                    avg. iterations per ep.: ${Math.round(avg_iter.value * 100)/100}`);
        env.reset();
    } else {
        const obs = env.getObservation();
        const actions = env.getActions();
        const act = await agt.chooseAction(obs, actions);
        const reward = env.performAction(act);
        totreward += reward;
        await agt.reward(reward);
    }
}

async function runWorld() {
    switch (runState) {
        case 0: // stop
            return;
        case 1: // run normal
            await worldTick();
            env.display();
            agt.display();
            graph1.update();
            graph2.update();
            pixiapp.render();
            requestAnimationFrame(runWorld);
            return;
        case 2: // run fast forward
            for (let i = 0; i < 100; i++)
                await worldTick();
            env.display();
            agt.display();
            graph1.update(0);
            graph2.update(0);
            pixiapp.render();
            requestAnimationFrame(runWorld);
            return;
    }
}

window.setStatus = function (text) {
    document.querySelector("#status").textContent = text;
}
window.setStatus2 = function (text) {
    document.querySelector("#status2").textContent = text;
}

window.setRunState = function (s) {
    const buttons = ['stpbutton', 'runbutton', 'ffwbutton'];
    for (const id of buttons) {
        document.querySelector("#" + id).className = "button is-small is-inline";
    }
    document.querySelector("#" + buttons[s]).className += " is-info is-selected";
    window.runState = s;
    requestAnimationFrame(runWorld);
    if(s != 0){
        setStatus(`Running`);
    } else {
        setStatus(`Ready`);
    }
    setStatus2("...");
}

window.reset = function () {
    setRunState(0); // stop
    episodes = 1;
    const envt = eval("Environments."+document.querySelector("#env").value);
    const agnt = eval("Agents."+document.querySelector("#agt").value);
    window.env = new envt(pixiapp);
    window.agt = new agnt(pixiapp);
    avg_iter = new AverageValue();
    avg_rew = new AverageValue();
    window.graph1 = new Chart('iter_ep', {
        type: "scatter",
        title: {
            display: true,
            text: 'Iter/Ep'
        },
        data: {
            datasets: [{
                showLine: true,
                label: 'Iter/Ep',
                data: [],
            }, {
                label: 'avg.',
                showLine: true,
                data: [],
                backgroundColor: "#aaffaaaa"
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
                label: 'Reward/Ep',
                data: [],
            },{
                showLine: true,
                label: 'avg.',
                data: [],
                backgroundColor: "#aaffaaaa",
            }],
        },
    });
    env.display();
    agt.display();
    graph1.update();
    graph2.update();
    pixiapp.render();
}

window.onload = main;