import Phaser from "phaser";
import { Board } from "./Board";
import EventBus from "./EventBus";
import type { BoardPosition, Piece } from "./Piece";
import { Game } from "./Game";

export class MainScene extends Phaser.Scene {
  public gameInstance!: Game;
  private gameModeText!: Phaser.GameObjects.Text;
  private playerIndicator!: Phaser.GameObjects.Text;
  private levelData: any;
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // 1. Сначала подписываемся на события
    this.setupEventListeners();

    // 2. Затем создаем игровой инстанс
    this.gameInstance = new Game(this, true);

    // 3. Если есть данные уровня - загружаем их
    if (this.levelData) {
      this.gameInstance.setLevelId(this.levelData.id);
      this.gameInstance.loadLevel(this.levelData);
    }

    // 4. Рисуем доску
    this.gameInstance.board.draw();
    this.createUI();
  }

  private createUI(): void {
    // Фон для UI элементов
    this.add.rectangle(0, 0, 800, 60, 0x000000).setOrigin(0, 0).setDepth(100);

    // Кнопка переключения режима
    this.gameModeText = this.add
      .text(20, 15, "Режим: Против ИИ", {
        fontSize: "24px",
        color: "#ffffff",
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .setDepth(101)
      .on("pointerdown", () => {
        const newMode = !this.gameInstance.getGameState().isAgainstAI;
        this.gameInstance.toggleGameMode(newMode);
        this.gameModeText.setText(
          `Режим: ${newMode ? "Против ИИ" : "Два игрока"}`
        );
      });

    // Индикатор хода
    this.playerIndicator = this.add
      .text(300, 15, "Ход: Игрок 1 (Вы)", {
        fontSize: "24px",
        color: "#55ff55",
        padding: { x: 10, y: 5 },
      })
      .setDepth(101);
  }

  private setupEventListeners(): void {
    EventBus.on("load-level", (levelData: any) => {
      console.log("Уровень получен в сцене:", levelData);
      this.levelData = levelData;

      // Если gameInstance уже создан - сразу загружаем уровень
      if (this.gameInstance) {
        this.gameInstance.loadLevel(levelData);
      }
    });
    EventBus.on("restart-game", () => {
      this.gameInstance = new Game(this, true);
      if (this.levelData) {
        this.gameInstance.loadLevel(this.levelData);
      }
      this.gameInstance.board.draw();
    });
    EventBus.on("game-update", (state: any) => {
      this.playerIndicator.setText(
        `Ход: ${
          state.currentPlayer === 1 ? "Игрок 1 (Вы)" : "Игрок 2 (Компьютер)"
        }`
      );
      this.playerIndicator.setColor(
        state.currentPlayer === 1 ? "#55ff55" : "#ff5555"
      );
    });

    // Обработка кликов на доске
    this.input.on("gameobjectdown", (pointer: any, gameObject: any) => {
      const pos = this.gameInstance.board.getBoardPosition(gameObject);
      if (pos) {
        this.gameInstance.handleClick(pos);
        this.handleGameUpdate(); // Важно: обновляем состояние после хода
      }
    });
  }

  private aiTurnInProgress = false;

  handleGameUpdate() {
    const gameState = this.gameInstance.getGameState();
    EventBus.emit("game-update", gameState);

    if (
      gameState.isAgainstAI &&
      gameState.currentPlayer === 2 &&
      gameState.movesLeft === 3 &&
      !this.aiTurnInProgress
    ) {
      this.aiTurnInProgress = true;
      this.gameInstance.makeAIMoveTurn().finally(() => {
        this.aiTurnInProgress = false;

        // Проверяем, что ход сменился
        if (this.gameInstance.getGameState().currentPlayer === 1) {
          this.handleGameUpdate();
        }
      });
    }
  }

  handlePieceSelected(piece: Piece, position: BoardPosition) {
    try {
      const pieceData = piece.getFullInfo();
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

  // Обработчик кликов Phaser будет перенаправлять клики в Game
  public handleBoardClick(pos: BoardPosition) {
    this.gameInstance.handleClick(pos);
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
