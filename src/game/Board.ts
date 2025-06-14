import Phaser from "phaser";
import { Piece, type PieceType } from "./Piece";
import { P } from "ts-pattern";

export interface BoardPosition {
  x: number;
  y: number;
}

export class Board {
  private scene: Phaser.Scene;

  private gridSize = 8;
  private tileSize = 100;

  private currentPlayer = 1;
  private movesLeft = 3;

  private pieces: (Piece | null)[][] = [];

  private selectedPos: BoardPosition | null = null;
  private highlightTiles: Phaser.GameObjects.Rectangle[] = [];

  private castleHP: { [key: number]: number } = {
    1: 100,
    2: 100,
  };

  private castlePos: { [key: number]: BoardPosition } = {
    1: { x: 4, y: 7 },
    2: { x: 4, y: 0 },
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    for (let y = 0; y < this.gridSize; y++) {
      this.pieces[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.pieces[y][x] = null; // пусто
      }
    }

    this.pieces[7][3] = new Piece("king", 1); // Король белых
    this.pieces[6][4] = new Piece("pawn", 1); // Пешка белых
    this.pieces[6][3] = new Piece("pawn", 1); // Пешка белых
    this.pieces[6][2] = new Piece("pawn", 1); // Пешка белых
    this.pieces[6][5] = new Piece("pawn", 1); // Пешка белых
    this.pieces[7][0] = new Piece("cannon", 1);
    this.pieces[7][7] = new Piece("cannon", 1);
    this.pieces[7][1] = new Piece("knight", 1);
    this.pieces[7][6] = new Piece("knight", 1);
    this.pieces[7][2] = new Piece("archer", 1);
    this.pieces[7][5] = new Piece("archer", 1);
    this.pieces[5][5] = new Piece("mage", 1);

    this.pieces[0][3] = new Piece("king", 2); // Король черных
    this.pieces[1][4] = new Piece("pawn", 2); // Пешка черных
    this.pieces[1][3] = new Piece("pawn", 2); // Пешка черных
    this.pieces[1][2] = new Piece("pawn", 2); // Пешка черных
    this.pieces[1][5] = new Piece("pawn", 2); // Пешка черных
    this.pieces[0][0] = new Piece("cannon", 2);
    this.pieces[0][7] = new Piece("cannon", 2);
    this.pieces[0][1] = new Piece("knight", 2);
    this.pieces[0][6] = new Piece("knight", 2);
    this.pieces[0][2] = new Piece("archer", 2);
    this.pieces[0][5] = new Piece("archer", 2);
  }

  draw() {
    this.scene.children.removeAll();

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // поле
        const isLight = (x + y) % 2 == 0;
        const rect = this.scene.add
          .rectangle(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            isLight ? 0xffffff : 0x888888
          )
          .setInteractive();

        rect.on("pointerdown", () => this.handleClick({ x, y }));

        // фигура
        const piece = this.pieces[y][x];
        if (piece) {
          // Используем разные спрайты в зависимости от фигуры
          const texture =
            piece.owner === 1 ? `${piece.type}_white` : `${piece.type}_black`;

          // В центре клетки вставляем спрайт с фигурой
          this.scene.add
            .image(
              x * this.tileSize + this.tileSize / 2,
              y * this.tileSize + this.tileSize / 2,
              texture
            )
            .setDisplaySize(this.tileSize * 0.8, this.tileSize * 0.8);

          // Рисуем HP над фигурой
          const isLight = (x + y) % 2 == 0;

          // В зависимости от клетки выбираем цвет текста
          const textColor = isLight ? "#000000" : "#ffffff";
          const strokeColor = isLight ? "#ffffff" : "#000000";

          this.scene.add
            .text(
              x * this.tileSize + this.tileSize / 2,
              y * this.tileSize + this.tileSize / 2 - this.tileSize * 0.4,
              `HP: ${piece.hp}`,
              {
                fontSize: "16px",
                color: textColor,
                fontFamily: "Courier",
                stroke: strokeColor,
                strokeThickness: 2, // даст обводку для читабельности
              }
            )
            .setOrigin(0.5);
        }
      }
    }

    // Рисуем замки
    for (const [player, pos] of Object.entries(this.castlePos)) {
      // выбираем картинку в зависимости от владельца
      const texture = +player === 1 ? "castle_white" : "castle_black";

      // вставляем спрайт замка
      this.scene.add
        .image(
          pos.x * this.tileSize + this.tileSize / 2,
          pos.y * this.tileSize + this.tileSize / 2,
          texture
        )
        .setDisplaySize(this.tileSize * 0.8, this.tileSize * 0.8)
        .setDepth(1);

      // выводим HP замка над картинкой
      this.scene.add
        .text(
          pos.x * this.tileSize + this.tileSize / 2,
          pos.y * this.tileSize + this.tileSize / 2 - this.tileSize * 0.5,
          `HP: ${this.castleHP[+player]}`,
          {
            fontSize: "16px",
            color: "#ffffff",
            fontFamily: "Courier",
            stroke: "#000000",
            strokeThickness: 2,
          }
        )
        .setOrigin(0.5);
    }

    this.highlightMoves();
  }

  handleClick(pos: BoardPosition) {
    const piece = this.getPieceAt(pos);

    if (this.selectedPos) {
      if (this.canMoveTo(pos)) {
        if (piece && piece.owner !== this.getPieceAt(this.selectedPos)!.owner) {
          // Атака фигурай
          this.attack(this.selectedPos, pos);
        } else if (
          (pos.x === this.castlePos[1].x &&
            pos.y === this.castlePos[1].y &&
            this.getPieceAt(this.selectedPos)!.owner !== 1) ||
          (pos.x === this.castlePos[2].x &&
            pos.y === this.castlePos[2].y &&
            this.getPieceAt(this.selectedPos)!.owner !== 2)
        ) {
          // Атака замка
          this.attack(this.selectedPos, pos);
        } else {
          // Ход
          this.movePiece(this.selectedPos, pos);
        }

        // В следующий ход
        this.movesLeft--;
        if (this.movesLeft <= 0) {
          // Смена игрока
          this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          this.movesLeft = 3;
          console.log(`✨ Ход перешел к игроку ${this.currentPlayer}`);
        }

        this.selectedPos = null;
        this.clearHighlights();
        this.draw();
        return;
      }
    }

    // В противном случае выбираем фигура, но ТОЛЬКО если владелец == currentPlayer
    if (piece && piece.owner === this.currentPlayer) {
      this.selectedPos = pos;
      this.clearHighlights();
      this.draw();
    } else {
      console.log("❌ Ты пытаешься взять чужую фигура!");
    }
  }

  canMoveTo(pos: BoardPosition): boolean {
    if (!this.selectedPos) return false;

    const piece = this.getPieceAt(this.selectedPos);
    if (!piece) return false;

    // Ходы
    const moves = piece.getPossibleMoves(this.pieces, this.selectedPos);
    if (moves.some((m) => m.x === pos.x && m.y === pos.y)) return true;

    const attacks = piece.getPossibleAttacks(this.pieces, this.selectedPos);
    if (attacks.some((a) => a.x === pos.x && a.y === pos.y)) return true;

    return false;
  }

  movePiece(from: BoardPosition, to: BoardPosition) {
    const piece = this.getPieceAt(from);
    if (!piece) return;

    // Забираем фигуру с предыдущей клетки
    this.pieces[to.y][to.x] = piece;
    this.pieces[from.y][from.x] = null;
  }

  getPieceAt(pos: BoardPosition): Piece | null {
    if (
      pos.x < 0 ||
      pos.x >= this.gridSize ||
      pos.y < 0 ||
      pos.y >= this.gridSize
    )
      return null;
    return this.pieces[pos.y][pos.x];
  }

  attack(attackerPos: BoardPosition, defenderPos: BoardPosition) {
    const attacker = this.getPieceAt(attackerPos);
    if (!attacker) return;

    if (attacker.type === "mage") {
      // Атака крестиком
      const attackPoints = [
        defenderPos,
        { x: defenderPos.x + 1, y: defenderPos.y },
        { x: defenderPos.x - 1, y: defenderPos.y },
        { x: defenderPos.x, y: defenderPos.y + 1 },
        { x: defenderPos.x, y: defenderPos.y - 1 },
      ];

      attackPoints.forEach((point) => {
        if (
          point.x < 0 ||
          point.x >= this.gridSize ||
          point.y < 0 ||
          point.y >= this.gridSize
        )
          return;

        const defender = this.getPieceAt(point);
        if (defender && defender.owner !== attacker.owner) {
          defender.hp -= attacker.attackDamage(attackerPos, point);
          if (defender.hp <= 0) {
            this.pieces[point.y][point.x] = null;
            if (defender.type == "king") {
              alert("Убедил всех, победа!");
            }
          }
        }
      });
    }

    // Атака по фигуре
    const defender = this.getPieceAt(defenderPos);
    if (defender) {
      const damage = attacker.attackDamage(attackerPos, defenderPos);
      defender.hp -= damage;

      if (defender.hp <= 0) {
        this.pieces[defenderPos.y][defenderPos.x] = null;
        if (defender.type == "king") {
          alert("Убедил всех, победа!");
        }
      }
    }
    // Атака по замку
    else if (
      defenderPos.x === this.castlePos[1].x &&
      defenderPos.y === this.castlePos[1].y
    ) {
      this.castleHP[1] -= attacker.attack;

      if (this.castleHP[1] <= 0) {
        alert("🔥 Победа 1-го!");
      }
    } else if (
      defenderPos.x === this.castlePos[2].x &&
      defenderPos.y === this.castlePos[2].y
    ) {
      this.castleHP[2] -= attacker.attack;

      if (this.castleHP[2] <= 0) {
        alert("🔥 Победа 2-го!");
      }
    }
  }

  highlightMoves() {
    this.clearHighlights();

    if (!this.selectedPos) return;

    const piece = this.getPieceAt(this.selectedPos);
    if (!piece) return;

    const moves = piece.getPossibleMoves(this.pieces, this.selectedPos);

    for (const move of moves) {
      const highlight = this.scene.add
        .rectangle(
          move.x * this.tileSize + this.tileSize / 2,
          move.y * this.tileSize + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          0x00ff00,
          0.4
        )
        .setDepth(1);
      this.highlightTiles.push(highlight);
    }

    if (piece.type === "archer" || piece.type === "mage") {
      const attacks = piece.getPossibleAttacks(this.pieces, this.selectedPos);
      for (const attack of attacks) {
        // Атакуемая клетка НЕ входит в moves
        if (moves.find((m) => m.x == attack.x && m.y == attack.y)) continue;

        const highlight = this.scene.add
          .rectangle(
            attack.x * this.tileSize + this.tileSize / 2,
            attack.y * this.tileSize + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            0xffff00,
            0.4
          )
          .setDepth(1);
        this.highlightTiles.push(highlight);
      }
    }
  }

  clearHighlights() {
    for (const h of this.highlightTiles) {
      h.destroy();
    }
    this.highlightTiles = [];
  }
}
