import { Board } from "./Board";
import { AiLogic } from "./AiLogic";
import type { MainScene } from "./MainScene";
import { type BoardPosition, type Piece, type PieceType } from "./Piece";
import { AiLogic2 } from "./AiLogic2";
import { King } from "./pieces/King";
import { Pawn } from "./pieces/Pawn";
import { PieceRegistry } from "./PieceRegistry";
import EventBus from "./EventBus";

export class Game {
  public board: Board;
  private ai: AiLogic2;
  private ai2: AiLogic2;
  private isAgainstAI: boolean;
  private scene: MainScene;
  public isPlacementPhase = true; // <--- ДОБАВИТЬ
  private selectedPieceTypeForPlacement: PieceType | null = null;

  constructor(scene: MainScene, againstAI: boolean = false) {
    this.scene = scene;
    this.isAgainstAI = againstAI;
    this.board = new Board(scene);
    this.ai = new AiLogic2(2, this.board); // ИИ играет за игрока 2
    this.ai2 = new AiLogic2(1, this.board); // ИИ играет за игрока 1
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus.on("select-piece-for-placement", (pieceType: PieceType) => {
      this.selectedPieceTypeForPlacement = pieceType;
      console.log(`Фигура для расстановки выбрана: ${pieceType}`);
    });

    EventBus.on("start-battle", () => {
      console.log("Получена команда начала боя!");
      this.isPlacementPhase = false;
      this.selectedPieceTypeForPlacement = null;
      // Можно добавить дополнительную логику, если нужно
    });
  }

  public handleClick(pos: BoardPosition): void {
    if (this.isPlacementPhase) {
      this.handlePlacementClick(pos); // <--- ВЫЗВАТЬ НОВУЮ ФУНКЦИЮ
      return;
    }

    if (this.isAgainstAI && this.board.currentPlayer !== 1) {
      console.log("Сейчас ход компьютера!");
      return;
    }
    this.board.handleClick(pos);
  }

  private handlePlacementClick(pos: BoardPosition): void {
    if (!this.selectedPieceTypeForPlacement) {
      console.log("Сначала выберите фигуру для расстановки из списка.");
      return;
    }

    const isValidPlacement = this.board.isValidPlacement(pos);

    if (isValidPlacement) {
      this.board.placePiece(pos, this.selectedPieceTypeForPlacement, 1);
      console.log(
        `Фигура ${this.selectedPieceTypeForPlacement} установлена на`,
        pos
      );

      // Убедитесь, что это событие отправляется. В качестве данных - тип фигуры.
      EventBus.emit("piece-placed", this.selectedPieceTypeForPlacement);

      this.selectedPieceTypeForPlacement = null;
    } else {
      console.log("Нельзя поставить фигуру сюда!");
    }
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
    this.board = new Board(this.scene);
    this.setLevelId(levelData.id);

    levelData.initialPieces.forEach((pieceData: any) => {
      // ЗАГРУЖАЕМ ТОЛЬКО ФИГУРЫ ПРОТИВНИКА (owner === 2)
      if (pieceData.owner === 2) {
        const PieceClass =
          PieceRegistry[pieceData.type as keyof typeof PieceRegistry];
        if (PieceClass) {
          const piece = new PieceClass(pieceData.owner);
          this.board.pieces[pieceData.y][pieceData.x] = piece;
        }
      }
    });

    this.ai = new AiLogic2(2, this.board);
    this.board.draw();
  }

  public setLevelId(levelId: number): void {
    this.board.setLevelId(levelId); // Передаем levelId в Board
  }
}
