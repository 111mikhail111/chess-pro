import { type BoardPosition } from "./Board";

export type PieceType =
  | "king"
  | "pawn"
  | "knight"
  | "archer"
  | "cannon"
  | "mage";

export class Piece {
  type: PieceType;
  level: number;
  hp: number;
  attack: number;
  owner: number; // 1 или 2 - игрок

  constructor(type: PieceType, owner: number) {
    this.type = type;
    this.owner = owner;
    this.level = 1;

    // Инициализация базовых HP и атаки
    this.hp = 0;
    this.attack = 0;
    this.initializeStats(type);
  }

  protected initializeStats(type: PieceType) {
    if (type === "king") {
      this.hp = 30;
      this.attack = 10;
    } else if (type === "pawn") {
      this.hp = 10;
      this.attack = 5;
    } else if (type === "cannon") {
      this.hp = 10;
      this.attack = 5;
    } else if (type === "knight") {
      this.hp = 15;
      this.attack = 7;
    } else if (type === "archer") {
      this.hp = 12;
      this.attack = 6;
    } else if (type === "mage") {
      this.hp = 5;
      this.attack = 3;
    }
  }

  // Эти методы будут переопределены в подклассах
  getPossibleMoves(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    return [];
  }

  getPossibleAttacks(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    return [];
  }

  // Новый метод для обработки атаки
  // Возвращает true, если цель была уничтожена (HP <= 0), false иначе
  // Для замков, можно вернуть специальное значение или передать колбэк
  attackTarget(
    attackerPos: BoardPosition,
    defenderPos: BoardPosition,
    boardPieces: (Piece | null)[][], // Добавлено для доступа к доске
    castleHP: { [key: number]: number },
    castlePos: { [key: number]: BoardPosition }
  ): boolean {
    const defender = boardPieces[defenderPos.y][defenderPos.x];

    if (defender && defender.owner !== this.owner) {
      const damage = this.calculateDamage(attackerPos, defenderPos, defender);
      defender.hp -= damage;
      if (defender.hp <= 0) {
        boardPieces[defenderPos.y][defenderPos.x] = null; // <-- Здесь удаляем фигуру с доски
        if (defender.type === "king") {
          alert(`👑 Игрок ${this.owner} победил, убив короля!`);
          return true; // Король уничтожен, игра закончена
        }
        return false; // Фигура уничтожена
      }
    } else if (
      (defenderPos.x === castlePos[1].x &&
        defenderPos.y === castlePos[1].y &&
        this.owner !== 1) ||
      (defenderPos.x === castlePos[2].x &&
        defenderPos.y === castlePos[2].y &&
        this.owner !== 2)
    ) {
      // Атака замка
      const targetCastleOwner =
        defenderPos.x === castlePos[1].x && defenderPos.y === castlePos[1].y
          ? 1
          : 2;
      castleHP[targetCastleOwner] -= this.attack;
      if (castleHP[targetCastleOwner] <= 0) {
        alert(
          `🔥 Игрок ${this.owner} победил, уничтожив замок игрока ${targetCastleOwner}!`
        );
        return true; // Замок уничтожен
      }
    }
    return false; // Цель не уничтожена
  }

  // Метод для расчета урона, будет переопределен для особых случаев (например, пушки)
  protected calculateDamage(
    attackerPos: BoardPosition,
    defenderPos: BoardPosition,
    defender: Piece
  ): number {
    return this.attack;
  }
}

export type { BoardPosition };
