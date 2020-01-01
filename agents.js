import * as tf from "@tensorflow/tfjs";
import { math, model } from "@tensorflow/tfjs";

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

    constructor(pixiapp, epsilon = 0.2, alpha=0.5, gamma=0.8) {
        this.pixiapp = pixiapp;

        this.experience = [];

        this.last_obs = null;
        this.last_act = -1;
        this.last_reward = 0;
        this.current_q = 0;

        this.epsilon = epsilon;
        this.alpha = alpha;
        this.gamma = gamma;

        // this.qnet = some tensorflow thingy;
        this.qnet = tf.sequential({
            name: "qnet",
            layers: [
                tf.layers.dense({ units: 10, activation: 'sigmoid', inputShape: [5] }),
                // tf.layers.dense({ units: 20, activation: 'sigmoid' }),
                tf.layers.dense({ units: 1 }),
            ]
        })

        this.predict_q = (obs, act) => tf.tidy(() => this.qnet.predict(
                tf.tensor([[...obs, act]])
            ).dataSync()[0]);

        this.qnet.compile({
            loss: tf.losses.meanSquaredError,
            optimizer: tf.train.adam(0.1),
            metrics: ['mse']
        })
    }

    async chooseAction(obs, actions) {
        // FOR PREVIOUS ONE
        // action_values = this.qnet.predict(obs);
        let max_act_val = -100, max_act = -1;
        for (const act of actions) {
            let action_value = this.predict_q(obs, act);
            if(max_act_val < action_value){
                max_act_val = action_value;
                max_act = act;
            }
        }
        this.current_q = max_act_val;
        if (this.last_obs){
            if (this.experience.length > 5000) {
                this.experience.shift();
            }
            this.experience.push([[...this.last_obs, this.last_act],
                             (1-this.alpha) * this.predict_q(this.last_obs, this.last_act)
                             + this.alpha * [this.last_reward + this.gamma * (this.current_q)]
            ]);
        }
        // learn from this.experience
        if (this.experience.length > 0)
            await this.learn();
        // PREDICT THIS ONE
        this.last_obs = obs;
        // choose according to epsilon greedy policy;
        if (Math.random() >= this.epsilon){
            // from actions, choose one with highest action_value;
            this.last_act = max_act;
        } else {
            this.last_act = actions[randomInt(0, actions.length - 1)];
        }
        // return chosen action;
        return this.last_act;
    }

    reward(r) {
        this.last_reward = r;
    }

    display() {

    }

    async learn(){
        const sample_exp = [...Array(500).keys()].map(() => this.experience[randomInt(0, this.experience.length - 1)]);
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
            }
        );
        console.log(`current q: ${this.current_q}\nloss: ${hist.history.loss[0]}`);
    }

}

// ---------------------------------------------------------------

// helper
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}