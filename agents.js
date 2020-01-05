import * as tf from "@tensorflow/tfjs";
import { Graphics } from "pixi.js";

let HEIGHT, WIDTH, SQH, SQW, GRIDH = 6, GRIDW = 8; // only for graphics

export class RandomAgent {

    constructor(pixiapp) {
        this.pixiapp = pixiapp;
    }

    chooseAction(obs, actions) {
        return actions[randomInt(0, actions.length - 1)];
    }

    reward(r) {

    }

    display() {

    }

}

// ---------------------------------------------------------------

export class DQNAgent {

    constructor(
            pixiapp,
            alpha = 1 / 3,
            gamma = 0.5,
            lr = 0.03,
            epsilon_iter = 1000,
            MAX_EXPERIENCE = 10000,
            EXPERIENCE_SAMPLE = 1024,
            VAL_RANDOM_SCALE = 0.1,
        ) {

        this.MAX_EXPERIENCE = MAX_EXPERIENCE;
        this.EXPERIENCE_SAMPLE = EXPERIENCE_SAMPLE;

        this.pixiapp = pixiapp;

        this.experience = [];

        this.last_obs = null;
        this.last_act = -1;
        this.last_reward = 0;
        this.current_q = 0;

        this.time = 1;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon_iter = epsilon_iter;

        // this.qnet = some tensorflow thingy;
        this.qnet = tf.sequential({
            name: "qnet",
            layers: [
                tf.layers.dense({
                    units: 5,
                    activation: 'sigmoid',
                    inputShape: [6],
                    // kernelRegularizer: tf.regularizers.l2(),
                    // biasRegularizer: tf.regularizers.l2()
                }),
                tf.layers.dense({
                    units: 1,
                }),
            ]
        })

        this.net_repr = (obs, act) => [...obs, act == 1, act == 2, act == 3, act == 4]
        this.net_repr_inv = (x,y, a1,a2,a3,a4) => [[x,y], a1*1+a2*2+a3*3+a4*4]

        this.predict_q = (obs, act) => tf.tidy(() => this.qnet.predict(
            tf.tensor([this.net_repr(obs, act)])
        ).dataSync()[0]) + VAL_RANDOM_SCALE * Math.random();

        this.qnet.compile({
            loss: tf.losses.meanSquaredError,
            optimizer: tf.train.momentum(lr, 0.9),
            metrics: ['mse']
        })

        // for arrows
        this.arrows = [[], [], [], []];
        this.initGraphics();
        this.display();
    }

    async chooseAction(obs, actions) {
        // FOR PREVIOUS ONE
        // action_values = this.qnet.predict(obs);
        let max_act_val = -100, max_act = -1;
        for (const act of actions) {
            let action_value = this.predict_q(obs, act);
            if (max_act_val < action_value) {
                max_act_val = action_value;
                max_act = act;
            }
        }
        this.current_q = max_act_val;
        if (this.last_obs) {
            if (this.experience.length > this.MAX_EXPERIENCE) {
                this.experience.shift();
            }
            this.experience.push([this.net_repr(this.last_obs, this.last_act),
                (1 - this.alpha) * this.predict_q(this.last_obs, this.last_act)
                + this.alpha * [this.last_reward + this.gamma * (this.current_q)]
            ]);
        }
        // learn from this.experience
        if (this.experience.length > 0)
            await this.learn();
        // PREDICT THIS ONE
        this.last_obs = obs;
        // choose according to epsilon greedy policy;
        if (Math.random() >= this.epsilon) {
            // from actions, choose one with highest action_value;
            this.last_act = max_act;
        } else {
            this.last_act = actions[randomInt(0, actions.length - 1)];
        }
        // return chosen action;
        this.time += 1;
        this.epsilon = Math.min(1, this.epsilon_iter / this.time);
        return this.last_act;
    }

    reward(r) {
        this.last_reward = r;
    }

    initGraphics() {
        HEIGHT = this.pixiapp.renderer.view.height;
        WIDTH = this.pixiapp.renderer.view.width;

        SQH = (HEIGHT - 1) / GRIDH;
        SQW = (WIDTH - 2) / GRIDW;

        this.allStateActionPairs = [];
        for (let i = 0; i < GRIDH; i++) {
            for (let j = 0; j < GRIDW; j++) {
                for (let k = 1; k <= 4; k++) {
                    this.allStateActionPairs.push(this.net_repr([i,j], k));
                }
            }
        }

        this.getArrowWeights = () => tf.tidy(() => {
            const t = tf.tensor(this.allStateActionPairs);
            const d = this.qnet.predict(t).dataSync();
            return this.allStateActionPairs.map((v, i) => [...this.net_repr_inv(...v), d[i]]);
        })


        for (let i = 0; i < GRIDH; i++) {
            for (let j = 0; j < GRIDW; j++) {
                const newArrow = (p, q) => {
                    const arrRed = new Graphics();
                    arrRed.lineStyle(5, 0x550000, 0.5);
                    arrRed.lineTo(SQH * p / 3, SQW * q / 3);
                    arrRed.position.x = SQW * (j + 0.5);
                    arrRed.position.y = SQW * (i + 0.5);
                    const arrGreen = new Graphics();
                    arrGreen.lineStyle(5, 0x005500, 0.5);
                    arrGreen.lineTo(SQH * p / 3, SQW * q / 3);
                    arrGreen.position.x = SQW * (j + 0.5);
                    arrGreen.position.y = SQW * (i + 0.5);
                    return [arrGreen, arrRed];
                }
                const arrLeft = newArrow(-1, 0);
                this.pixiapp.stage.addChild(arrLeft[0]);
                this.pixiapp.stage.addChild(arrLeft[1]);
                this.arrows[0].push(arrLeft);
                const arrRight = newArrow(+1, 0);
                this.pixiapp.stage.addChild(arrRight[0]);
                this.pixiapp.stage.addChild(arrRight[1]);
                this.arrows[1].push(arrRight);
                const arrUp = newArrow(0, -1);
                this.pixiapp.stage.addChild(arrUp[0]);
                this.pixiapp.stage.addChild(arrUp[1]);
                this.arrows[2].push(arrUp);
                const arrDown = newArrow(0, +1);
                this.pixiapp.stage.addChild(arrDown[0]);
                this.pixiapp.stage.addChild(arrDown[1]);
                this.arrows[3].push(arrDown);
            }
        }

    }

    display() {
        const SCALE = 3;
        for (const [pos, k, v] of this.getArrowWeights()) {
            const [i,j] = pos;
            const idx = i * GRIDW + j;            
            if (v > 0) {
                this.arrows[k - 1][idx][0].scale.set(v / SCALE);
                this.arrows[k - 1][idx][1].scale.set(0);
            } else {
                this.arrows[k - 1][idx][0].scale.set(0);
                this.arrows[k - 1][idx][1].scale.set(- v / SCALE);
            }
        }
        setStatus2(`iter:${round2(this.time)}
           current q: ${round2(this.current_q)}
           loss: ${round2(this.last_loss)}
           epsilon: ${round2(this.epsilon)}`);
    }

    async learn() {
        const sample_exp = [...Array(this.EXPERIENCE_SAMPLE).keys()].map(() => this.experience[randomInt(0, this.experience.length - 1)]);
        const hist = await this.qnet.fit(
            tf.tidy(() => {
                const training_x = tf.tensor(sample_exp.map((e) => e[0]));
                return training_x;
            }),
            tf.tidy(() => {
                const training_y = tf.tensor(sample_exp.map((e) => e[1]));
                return training_y;
            }),
            {
                epochs: 1,
                batchSize: this.EXPERIENCE_SAMPLE,
            }
        );
        this.last_loss = hist.history.loss[0];
    }

}

// ---------------------------------------------------------------

// helper
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(x) {
    return Math.round(x * 100) / 100;
}
