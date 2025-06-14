import Phaser from "phaser";
import { MainScene } from "./game/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  scene: [MainScene],
};

new Phaser.Game(config);
