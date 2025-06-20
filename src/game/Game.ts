import { Board } from "./Board";
import { AiLogic } from "./AiLogic";
import type { MainScene } from "./MainScene";
import { type BoardPosition, type Piece } from "./Piece";
import { AiLogic2 } from "./AiLogic2";
import { King } from "./pieces/King";
import { Pawn } from "./pieces/Pawn";
import { PieceRegistry } from "./PieceRegistry";

export class Game {
  public board: Board;
  private ai: AiLogic2;
  private ai2: AiLogic2;
  private isAgainstAI: boolean;
  private scene: MainScene;

  constructor(scene: MainScene, againstAI: boolean = false) {
    this.scene = scene;
    this.isAgainstAI = againstAI;
    this.board = new Board(scene);
    this.ai = new AiLogic2(2, this.board); // ИИ играет за игрока 2
    this.ai2 = new AiLogic2(1, this.board); // ИИ играет за игрока 1
  }

  public handleClick(pos: BoardPosition): void {
    if (this.isAgainstAI && this.board.currentPlayer !== 1) {
      console.log("Сейчас ход компьютера!");
      return;
    }
    this.board.handleClick(pos);
  }

  public async makeAIMoveTurn(): Promise<void> {
    console.log(
      "Начался ход компьютера",
      this.board.movesLeft,
      this.board.currentPlayer
    );
    for (let i = 0; i < 3; i++) {
      console.log(
        "Осталось ходов",
        this.board.movesLeft,
        "Чей ход",
        this.board.currentPlayer
      );
      if (this.board.currentPlayer !== 2 || this.board.movesLeft <= 0) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const bestMove = await this.ai.computeBestMove();
      console.log("best move", bestMove);
      if (!bestMove) break;
      this.board.handleClick(bestMove.from);
      const before = this.board.movesLeft;
      this.board.handleClick(bestMove.to);
      const after = this.board.movesLeft;
      if (after === before) {
        // Ход не удался, чтобы не зациклиться — break
        console.log("Ход компьютера не удался");
        break;
      }
    }
    console.log("Ход компьютера завершен");
  }

  public async makeAIMoveTurn2(): Promise<void> {
    console.log(
      "Начался ход компьютера2",
      this.board.movesLeft,
      this.board.currentPlayer
    );
    for (let i = 0; i < 3; i++) {
      if (this.board.currentPlayer !== 1 || this.board.movesLeft <= 0) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const bestMove = await this.ai2.computeBestMove();
      if (!bestMove) break;
      this.board.handleClick(bestMove.from);
      const before = this.board.movesLeft;
      this.board.handleClick(bestMove.to);
      const after = this.board.movesLeft;
      if (after === before) {
        break;
      }
    }
    console.log("Ход компьютера завершен2");
  }

  public toggleGameMode(againstAI: boolean): void {
    this.isAgainstAI = againstAI;
    this.board = new Board(this.scene);
    if (againstAI) {
      this.ai = new AiLogic2(2, this.board);
    }
    this.board.draw();
  }

  public getGameState() {
    return {
      currentPlayer: this.board.currentPlayer,
      movesLeft: this.board.movesLeft,
      isAgainstAI: this.isAgainstAI,
    };
  }

  public loadLevel(levelData: any) {
    // Очищаем текущую доску
    this.board = new Board(this.scene);
    this.setLevelId(levelData.id);
    // Загружаем фигуры из уровня
    levelData.initialPieces.forEach((pieceData: any) => {
      const PieceClass =
        PieceRegistry[pieceData.type as keyof typeof PieceRegistry];

      if (!PieceClass) {
        console.error(`Unknown piece type: ${pieceData.type}`);
        return;
      }

      const piece = new PieceClass(pieceData.owner);
      this.board.pieces[pieceData.y][pieceData.x] = piece;
    });

    this.ai = new AiLogic2(2, this.board);
    this.board.draw();
  }

  public setLevelId(levelId: number): void {
    this.board.setLevelId(levelId); // Передаем levelId в Board
  }
}
