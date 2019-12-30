import * as PIXI from "pixi.js";
import "./index.scss";

const app = new PIXI.Application({width: 256, height: 256});
document.querySelector("#pixiapp").appendChild(app.view);