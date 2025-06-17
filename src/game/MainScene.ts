import Phaser from "phaser";
import { Board } from "./Board";
import EventBus from "./EventBus";
import type { BoardPosition, Piece } from "./Piece";

export class MainScene extends Phaser.Scene {
  private board!: Board;

  constructor() {
    super({ key: "MainScene" });
  }

  handleGameUpdate() {
    // Отправляем данные о текущем состоянии игры
    EventBus.emit("game-update", {
      currentPlayer: this.board.currentPlayer,
      movesLeft: this.board.movesLeft,
      // другие данные...
    });
  }

  handlePieceSelected(piece: Piece, position: BoardPosition) {
    try {
      // Используем новый метод getFullInfo()
      const pieceData = piece.getFullInfo();
      console.log("Emitting piece data:", pieceData);
      EventBus.emit("piece-selected", pieceData);
    } catch (error) {
      console.error("Error in handlePieceSelected:", error);
      EventBus.emit("piece-selected", {
        name: piece.type,
        stats: {
          level: piece.level,
          health: piece.hp,
          attack: piece.attack,
        },
        movement: null,
        attack: null,
        skills: null,
      });
    }
  }

  addMoveToHistory(moveDescription: string) {
    EventBus.emit("move-recorded", moveDescription);
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
    this.load.image("mage_white", "sprites/mage_white.png");
    this.load.image("mage_black", "sprites/mage_black.png");
    // … другие фигуры
  }
}
