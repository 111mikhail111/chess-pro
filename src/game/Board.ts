import Phaser from "phaser";
import { Piece, type PieceType } from "./Piece";
import { King } from "./pieces/King";
import { Pawn } from "./pieces/Pawn";
import { Cannon } from "./pieces/Cannon";
import { Knight } from "./pieces/Knight";
import { Archer } from "./pieces/Archer";
import { Mage } from "./pieces/Mage";
import type { MainScene } from "./MainScene";
import EventBus from "./EventBus";
import type { Game } from "./Game";

export interface BoardPosition {
  x: number;
  y: number;
}

export class Board {
  public scene: Phaser.Scene;
  private levelId: number | null = null;

  public gridSize = 8;
  public tileSize = 85;

  public currentPlayer = 1;
  public movesLeft = 3;

  public pieces: (Piece | null)[][] = [];

  public selectedPos: BoardPosition | null = null;
  public highlightTiles: Phaser.GameObjects.Rectangle[] = [];

  public castleHP: { [key: number]: number } = {
    1: 100,
    2: 100,
  };

  public castlePos: { [key: number]: BoardPosition } = {
    1: { x: 4, y: 7 },
    2: { x: 4, y: 0 },
  };

  // В классе Board
  private boardTiles: Phaser.GameObjects.Rectangle[] = [];
  private pieceSprites: Phaser.GameObjects.Image[] = [];
  private hpTexts: Phaser.GameObjects.Text[] = [];
  private castleSprites: Phaser.GameObjects.Image[] = [];
  private castleHpTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    for (let y = 0; y < this.gridSize; y++) {
      this.pieces[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.pieces[y][x] = null; // пусто
      }
    }

    // Инициализация фигур с использованием новых классов
    /*
    this.pieces[7][3] = new King(1); // Король белых
    this.pieces[6][4] = new Pawn(1); // Пешка белых
    this.pieces[6][3] = new Pawn(1); // Пешка белых
    this.pieces[6][2] = new Pawn(1); // Пешка белых
    this.pieces[6][5] = new Pawn(1); // Пешка белых
    this.pieces[7][0] = new Cannon(1);
    this.pieces[7][7] = new Cannon(1);
    this.pieces[7][1] = new Knight(1);
    this.pieces[7][6] = new Knight(1);
    this.pieces[7][2] = new Archer(1);
    this.pieces[7][5] = new Archer(1);
    this.pieces[5][5] = new Mage(1);

    this.pieces[0][3] = new King(2); // Король черных
    this.pieces[1][4] = new Pawn(2); // Пешка черных
    this.pieces[1][3] = new Pawn(2); // Пешка черных
    this.pieces[1][2] = new Pawn(2); // Пешка черных
    this.pieces[1][5] = new Pawn(2); // Пешка черных
    this.pieces[0][0] = new Cannon(2);
    this.pieces[0][7] = new Cannon(2);
    this.pieces[0][1] = new Knight(2);
    this.pieces[0][6] = new Knight(2);
    this.pieces[0][2] = new Archer(2);
    this.pieces[0][5] = new Archer(2);
*/
  }

  public setLevelId(levelId: number): void {
    this.levelId = levelId;
  }

  public getBoardPosition(
    gameObject: Phaser.GameObjects.GameObject
  ): BoardPosition | null {
    // Получаем размеры сцены
    const width = this.scene.sys.game.config.width as number;
    const height = this.scene.sys.game.config.height as number;

    // Смещаем поле по центру
    const offsetX = (width - this.gridSize * this.tileSize) / 2;
    const offsetY = (height - this.gridSize * this.tileSize) / 2;

    // Получаем координаты объекта
    const objX = (gameObject as any).x; // Приведение типа, так как Phaser не предоставляет явных типов
    const objY = (gameObject as any).y;

    // Вычисляем позицию на доске
    const x = Math.floor((objX - offsetX) / this.tileSize);
    const y = Math.floor((objY - offsetY) / this.tileSize);

    // Проверяем, что позиция в пределах доски
    if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
      return { x, y };
    }
    return null;
  }

  draw() {
    // В начале draw()
    this.boardTiles.forEach((obj) => obj.destroy());
    this.pieceSprites.forEach((obj) => obj.destroy());
    this.hpTexts.forEach((obj) => obj.destroy());
    this.castleSprites.forEach((obj) => obj.destroy());
    this.castleHpTexts.forEach((obj) => obj.destroy());

    this.boardTiles = [];
    this.pieceSprites = [];
    this.hpTexts = [];
    this.castleSprites = [];
    this.castleHpTexts = [];

    // Получаем размеры сцены
    const width = this.scene.sys.game.config.width as number;
    const height = this.scene.sys.game.config.height as number;

    // Смещаем поле по центре
    const offsetX = (width - this.gridSize * this.tileSize) / 2;
    const offsetY = (height - this.gridSize * this.tileSize) / 2;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // поле
        const isLight = (x + y) % 2 == 0;
        const rect = this.scene.add
          .rectangle(
            offsetX + x * this.tileSize + this.tileSize / 2,
            offsetY + y * this.tileSize + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            isLight ? 0xffffff : 0x888888
          )
          .setInteractive();
        this.boardTiles.push(rect);

        rect.on("pointerdown", () => {
          (this.scene as MainScene).handleBoardClick({ x, y });
        });

        // фигура
        const piece = this.pieces[y][x];
        if (piece) {
          // Используем разные спрайты в зависимости от фигуры
          const texture =
            piece.owner === 1 ? `${piece.type}_white` : `${piece.type}_black`;

          // В центре клетки вставляем спрайт с фигурой
          const sprite = this.scene.add
            .image(
              offsetX + x * this.tileSize + this.tileSize / 2,
              offsetY + y * this.tileSize + this.tileSize / 2,
              texture
            )
            .setDisplaySize(this.tileSize * 0.8, this.tileSize * 0.8)
            .setOrigin(0.5);
          this.pieceSprites.push(sprite);

          // Рисуем HP над фигурой
          const isLight = (x + y) % 2 == 0;

          // В зависимости от клетки выбираем цвет текста
          const textColor = isLight ? "#000000" : "#ffffff";
          const strokeColor = isLight ? "#ffffff" : "#000000";

          const hpText = this.scene.add
            .text(
              offsetX + x * this.tileSize + this.tileSize / 2,
              offsetY +
                y * this.tileSize +
                this.tileSize / 2 -
                this.tileSize * 0.4,
              `HP: ${piece.hp}`,
              {
                fontSize: "16px",
                color: textColor,
                fontFamily: "Courier",
                stroke: strokeColor,
                strokeThickness: 2,
              }
            )
            .setOrigin(0.5);
          this.hpTexts.push(hpText);
        }
      }
    }

    // Рисуем замки
    for (const [player, pos] of Object.entries(this.castlePos)) {
      // выбираем картинку в зависимости от владельца
      const texture = +player === 1 ? "castle_white" : "castle_black";

      // вставляем спрайт замка
      const castleSprite = this.scene.add
        .image(
          offsetX + pos.x * this.tileSize + this.tileSize / 2,
          offsetY + pos.y * this.tileSize + this.tileSize / 2,
          texture
        )
        .setDisplaySize(this.tileSize * 0.8, this.tileSize * 0.8)
        .setDepth(1)
        .setOrigin(0.5);
      this.castleSprites.push(castleSprite);

      // выводим HP замка над картинкой
      const castleHpText = this.scene.add
        .text(
          offsetX + pos.x * this.tileSize + this.tileSize / 2,
          offsetY +
            pos.y * this.tileSize +
            this.tileSize / 2 -
            this.tileSize * 0.4,
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
      this.castleHpTexts.push(castleHpText);
    }

    this.highlightMoves();
  }

  handleClick(pos: BoardPosition) {
    console.log(
      `[Board.handleClick] Вызван с позицией:`,
      pos,
      `Текущий игрок: ${this.currentPlayer}, Осталось ходов: ${this.movesLeft}`
    );
    const piece = this.getPieceAt(pos);

    if (this.selectedPos) {
      // Есть выбранная фигура, пытаемся сделать ход или атаку
      console.log(
        `[Board.handleClick] Есть выбранная фигура:`,
        this.selectedPos,
        `Фигура:`,
        this.getPieceAt(this.selectedPos)
      );
      if (this.canMoveTo(pos)) {
        const attacker = this.getPieceAt(this.selectedPos)!;
        const targetPiece = this.getPieceAt(pos);

        let actionTaken = false; // Флаг, указывающий, было ли совершено действие (ход или атака)

        let isCastleAttack = false;
        if (
          (pos.x === this.castlePos[1].x &&
            pos.y === this.castlePos[1].y &&
            attacker.owner !== 1) ||
          (pos.x === this.castlePos[2].x &&
            pos.y === this.castlePos[2].y &&
            attacker.owner !== 2)
        ) {
          isCastleAttack = true;
        }

        if (
          (targetPiece && targetPiece.owner !== attacker.owner) ||
          isCastleAttack
        ) {
          // Это атака
          const isGameOver = attacker.attackTarget(
            this.selectedPos,
            pos,
            this.pieces, // Передаем ссылку на массив pieces
            this.castleHP,
            this.castlePos
          );
          actionTaken = true; // Атака считается действием

          // Если игра окончена, не уменьшаем ходы и не меняем игрока
          if (isGameOver) {
            this.selectedPos = null;
            this.clearHighlights();
            this.draw(); // Обновляем доску после убийства
            console.log("Игра оконченааааа!");
            (this.scene as MainScene).handleGameUpdate();
            const winner = attacker.owner === 1 ? 1 : 2;
            console.log(winner, this.currentPlayer, this.currentPlayer == 1);
            EventBus.emit("game-over", {
              isWin: this.currentPlayer == 1,
              levelId: this.levelId,
            });
            return; // Завершаем функцию, так как игра окончена
          }
        } else {
          // Это просто ход на пустую клетку (или на свою фигуру, что should be prevented by canMoveTo)
          // Проверяем, что цель - пустая клетка, чтобы избежать перемещения на свою фигуру
          if (this.pieces[pos.y][pos.x] === null) {
            this.movePiece(this.selectedPos, pos);
            actionTaken = true; // Ход считается действием
          }
        }

        // Если было совершено действие (ход или атака), уменьшаем ходы и, если нужно, меняем игрока
        if (actionTaken) {
          this.recordMove(
            this.selectedPos,
            pos,
            targetPiece || isCastleAttack
              ? isCastleAttack
                ? "castle-attack"
                : "attack"
              : "move",
            attacker,
            targetPiece
          );
          console.log(
            "Уменьшаем количество ходов. Было",
            this.movesLeft,
            "Стало",
            this.movesLeft - 1
          );
          this.movesLeft--;
          if (this.movesLeft <= 0) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.movesLeft = 3;
            console.log(`✨ Ход перешел к игроку ${this.currentPlayer}`);
          }
        }

        this.selectedPos = null;
        this.clearHighlights();
        this.draw(); // Всегда перерисовываем доску после потенциального изменения
        (this.scene as MainScene).handleGameUpdate();
        return; // Завершаем, так как мы обработали клик как ход/атаку
      }
    }

    // Если нет выбранной фигуры, или клик не привел к ходу/атаке:
    // Попытка выбрать фигуру
    if (piece && piece.owner === this.currentPlayer) {
      (this.scene as MainScene).handlePieceSelected(piece, pos);
      this.selectedPos = pos;
      this.clearHighlights();
      this.draw(); // Перерисовываем для подсветки возможных ходов
    } else if (piece) {
      console.log("❌ Ты пытаешься взять чужую фигуру!");
    } else {
      console.log("Клетка пуста или не является допустимым ходом.");
    }
    (this.scene as MainScene).handleGameUpdate();
  }

  canMoveTo(pos: BoardPosition): boolean {
    if (!this.selectedPos) return false;

    const piece = this.getPieceAt(this.selectedPos);
    if (!piece) return false;

    // Ходы
    const moves = piece.getPossibleMoves(this.pieces, this.selectedPos);
    const canMoveNormally = moves.some((m) => m.x === pos.x && m.y === pos.y);

    // Атаки
    const attacks = piece.getPossibleAttacks(this.pieces, this.selectedPos);
    const canAttackPiece = attacks.some((a) => a.x === pos.x && a.y === pos.y);

    // Проверяем, есть ли на целевой клетке своя фигура
    const targetPiece = this.getPieceAt(pos);
    if (targetPiece && targetPiece.owner === piece.owner) {
      return false; // Нельзя ходить на свою фигуру (кроме, возможно, особых правил)
    }

    // Если на целевой клетке есть фигура противника, это должна быть атака
    if (targetPiece && targetPiece.owner !== piece.owner) {
      return canAttackPiece;
    }

    // Если клетка пуста, это должен быть обычный ход
    if (targetPiece === null) {
      return canMoveNormally;
    }

    // Проверка на атаку замка
    if (
      (pos.x === this.castlePos[1].x &&
        pos.y === this.castlePos[1].y &&
        piece.owner !== 1) ||
      (pos.x === this.castlePos[2].x &&
        pos.y === this.castlePos[2].y &&
        piece.owner !== 2)
    ) {
      return canAttackPiece; // Замок может быть атакован, если фигура может атаковать эту позицию
    }

    return false; // По умолчанию, если ни одно из условий не выполнено
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

  public simulateMove(from: BoardPosition, to: BoardPosition): boolean {
    const piece = this.getPieceAt(from);
    if (!piece || piece.owner !== this.currentPlayer) return false;

    // Проверяем, можно ли сходить
    const possibleMoves = piece.getPossibleMoves(this.pieces, from);
    const possibleAttacks = piece.getPossibleAttacks(this.pieces, from);

    // Ход
    if (possibleMoves.some((pos) => pos.x === to.x && pos.y === to.y)) {
      this.pieces[to.y][to.x] = piece;
      this.pieces[from.y][from.x] = null;
      this.movesLeft--;
      return true;
    }

    // Атака
    if (possibleAttacks.some((pos) => pos.x === to.x && pos.y === to.y)) {
      this.pieces[to.y][to.x] = piece;
      this.pieces[from.y][from.x] = null;
      this.movesLeft--;
      return true;
    }

    return false;
  }

  highlightMoves() {
    this.clearHighlights();

    if (!this.selectedPos) return;

    const piece = this.getPieceAt(this.selectedPos);
    if (!piece) return;

    // Получаем размеры сцены и смещение
    const width = this.scene.sys.game.config.width as number;
    const height = this.scene.sys.game.config.height as number;
    const offsetX = (width - this.gridSize * this.tileSize) / 2;
    const offsetY = (height - this.gridSize * this.tileSize) / 2;

    const moves = piece.getPossibleMoves(this.pieces, this.selectedPos);

    for (const move of moves) {
      const targetPiece = this.getPieceAt(move);
      if (targetPiece && targetPiece.owner === piece.owner) continue;

      const highlight = this.scene.add
        .rectangle(
          offsetX + move.x * this.tileSize + this.tileSize / 2,
          offsetY + move.y * this.tileSize + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          0x00ff00,
          0.4
        )
        .setDepth(1);
      this.highlightTiles.push(highlight);
    }

    const attacks = piece.getPossibleAttacks(this.pieces, this.selectedPos);
    for (const attack of attacks) {
      const isAlreadyHighlightedAsMove = moves.some(
        (m) => m.x === attack.x && m.y === attack.y
      );
      const targetPiece = this.getPieceAt(attack);

      if (
        (targetPiece && targetPiece.owner !== piece.owner) ||
        (attack.x === this.castlePos[1].x &&
          attack.y === this.castlePos[1].y &&
          piece.owner !== 1) ||
        (attack.x === this.castlePos[2].x &&
          attack.y === this.castlePos[2].y &&
          piece.owner !== 2)
      ) {
        if (!isAlreadyHighlightedAsMove) {
          const highlight = this.scene.add
            .rectangle(
              offsetX + attack.x * this.tileSize + this.tileSize / 2,
              offsetY + attack.y * this.tileSize + this.tileSize / 2,
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
  }

  clearHighlights() {
    for (const h of this.highlightTiles) {
      h.destroy();
    }
    this.highlightTiles = [];
  }

  // В классе Board добавьте:
  private recordMove(
    from: BoardPosition,
    to: BoardPosition,
    action: "move" | "attack" | "castle-attack",
    piece: Piece,
    target?: Piece | null
  ) {
    const pieceName = this.getPieceName(piece.type, piece.owner);
    const fromPos = this.positionToChessNotation(from);
    const toPos = this.positionToChessNotation(to);

    let moveDescription = "";

    switch (action) {
      case "move":
        moveDescription = `${pieceName} походил (${fromPos}-${toPos})`;
        break;
      case "attack":
        const targetName = target
          ? this.getPieceName(target.type, target.owner)
          : "фигура";
        moveDescription = `${pieceName} атаковал ${targetName} (${fromPos}x${toPos})`;
        break;
      case "castle-attack":
        moveDescription = `${pieceName} атаковал замок врага (${fromPos}x${toPos})`;
        break;
    }

    (this.scene as MainScene).addMoveToHistory(moveDescription);
  }

  private positionToChessNotation(pos: BoardPosition): string {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
    return `${letters[pos.x]}${8 - pos.y}`;
  }

  private getPieceName(type: PieceType, owner: number): string {
    const names: Record<PieceType, string> = {
      king: "Король",
      pawn: "Пешка",
      knight: "Конь",
      archer: "Лучник",
      cannon: "Пушка",
      mage: "Маг",
    };
    return `${names[type]} ${owner === 1 ? "белых" : "чёрных"}`;
  }
}
