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

    constructor(pixiapp) {
        this.pixiapp = pixiapp;

        this.experience = [];

        this.current_obs = null;
        this.chosen_action = 0;

        // this.qnet = some tensorflow thingy;
    }

    chooseAction(obs, actions) {
        // this.current_obs = obs;
        // action_values = this.qnet.predict(obs);
        // from actions, choose one with highest action_values;
        // choose according to epsilon greedy policy;
        // return chosen action;
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