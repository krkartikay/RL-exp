import * as tf from "@tensorflow/tfjs";
import { math } from "@tensorflow/tfjs";

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

    constructor(pixiapp, epsilon = 0.2) {
        this.pixiapp = pixiapp;

        this.experience = [];

        this.current_obs = null;
        this.chosen_action = 0;

        this.epsilon = epsilon;

        // this.qnet = some tensorflow thingy;
        this.qnet = tf.sequential({
            name: "qnet",
            layers: [
                tf.layers.dense({ units: 20, activation: 'sigmoid', inputShape: [5] }),
                tf.layers.dense({ units: 20, activation: 'sigmoid' }),
                tf.layers.dense({ units: 1 }),
            ]
        })

        this.predict_q = (obs, act) => tf.tidy(() => this.qnet.predict(
                tf.tensor([[...obs, act]])
            ).dataSync()[0]);
    }

    chooseAction(obs, actions) {
        // this.current_obs = obs;
        this.current_obs = obs;
        // action_values = this.qnet.predict(obs);
        let max_act_val = -100, max_act = -1;
        // choose according to epsilon greedy policy;
        if (Math.random() >= this.epsilon){
            // from actions, choose one with highest action_value;
            for (const act of actions) {
                let action_value = this.predict_q(obs, act);
                if(max_act_val < action_value){
                    max_act_val = action_value;
                    max_act = act;
                }
            }
            this.chosen_action = max_act;
        } else {
            this.chosen_action = actions[randomInt(0, actions.length - 1)];
        }
        // return chosen action;
        return this.chosen_action;
    }

    reward(r) {
        // this.experience.push([this.current_obs, this.chosen_action, reward r]);
        // learn from this.experience
    }

    display() {

    }

}

// ---------------------------------------------------------------

// helper
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}