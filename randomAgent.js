export default
class RandomAgent {

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

// helper
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}