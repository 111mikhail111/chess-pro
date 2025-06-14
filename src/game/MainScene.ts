import Phaser from "phaser";
import { Board } from "./Board";

export class MainScene extends Phaser.Scene {
  private board!: Board;

  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    this.board = new Board(this);
    this.board.draw();
  }

  update() {
    // если нужна анимация или AI - сюда
  }

  preload() {
    this.load.image("king_black", "sprites/king_black.png");
    this.load.image("king_white", "sprites/king_white.png");
    this.load.image("pawn_white", "sprites/pawn_white.png");
    this.load.image("pawn_black", "sprites/pawn_black.png");
    this.load.image("cannon_white", "sprites/cannon_white.png");
    this.load.image("cannon_black", "sprites/cannon_black.png");
    this.load.image("knight_white", "sprites/knight_white.png");
    this.load.image("knight_black", "sprites/knight_black.png");
    this.load.image("castle_white", "sprites/castle_white.png");
    this.load.image("castle_black", "sprites/castle_black.png");
    this.load.image("archer_white", "sprites/archer_white.png");
    this.load.image("archer_black", "sprites/archer_black.png");
    // … другие фигуры
  }
}
