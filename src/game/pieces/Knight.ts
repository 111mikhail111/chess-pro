import { Piece, type BoardPosition } from "../Piece";

export class Knight extends Piece {
  constructor(owner: number) {
    super("knight", owner);
  }

  getPossibleMoves(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const knightMoves = [
      { dx: 1, dy: 2 },
      { dx: 2, dy: 1 },
      { dx: -1, dy: 2 },
      { dx: -2, dy: 1 },
      { dx: 1, dy: -2 },
      { dx: 2, dy: -1 },
      { dx: -1, dy: -2 },
      { dx: -2, dy: -1 },
    ];

    for (const move of knightMoves) {
      const nx = position.x + move.dx;
      const ny = position.y + move.dy;

      if (nx < 0 || nx >= board[0].length || ny < 0 || ny >= board.length) {
        continue;
      }

      if (board[ny][nx] == null || board[ny][nx]?.owner !== this.owner) {
        moves.push({ x: nx, y: ny });
      }
    }
    return moves;
  }

  getPossibleAttacks(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    // Для коня атаки совпадают с ходами
    return this.getPossibleMoves(board, position).filter((move) => {
      const targetPiece = board[move.y][move.x];
      return targetPiece && targetPiece.owner !== this.owner;
    });
  }

  // Добавляем новые методы для информации о движении и атаке
  getMovementInfo(): { type: string; range: number } {
    return {
      type: this.getMovementType(),
      range: this.getMovementRange(),
    };
  }

  getAttackInfo(): { type: string; range: number; damage: number } {
    return {
      type: this.getAttackType(),
      range: this.getAttackRange(),
      damage: this.attack,
    };
  }

  getSkills(): Array<{ name: string; description: string; cooldown: number }> {
    return this.getPieceSkills();
  }

  // Защищенные методы для переопределения в дочерних классах
  protected getMovementType(): string {
    return "Буквой г";
  }

  protected getMovementRange(): number {
    return 2.5;
  }

  protected getAttackType(): string {
    return "Как передвижение";
  }

  protected getAttackRange(): number {
    return 2.5;
  }

  protected getPieceSkills() {
    const baseSkills = [
      {
        name: "Базовая наскок",
        description: "Обычная атака без особых эффектов",
        cooldown: 0,
      },
    ];

    // Добавляем уникальные навыки для конкретных фигур
    

    return baseSkills;
  }

  // Метод для получения всей информации о фигуре
  getFullInfo() {
    return {
      name: this.type,
      stats: {
        level: this.level,
        health: this.hp,
        attack: this.attack,
      },
      movement: this.getMovementInfo(),
      attack: this.getAttackInfo(),
      skills: this.getSkills(),
    };
  }
}