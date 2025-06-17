import { Piece, type BoardPosition } from "../Piece";

export class King extends Piece {
  constructor(owner: number) {
    super("king", owner);
  }

  getPossibleMoves(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const directions = [
      { dx: -1, dy: -1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ];

    for (const d of directions) {
      const nx = position.x + d.dx;
      const ny = position.y + d.dy;

      if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
        // Король может ходить на пустые клетки или клетки с фигурой противника (для атаки)
        if (board[ny][nx] == null || board[ny][nx]?.owner !== this.owner) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
    return moves;
  }

  getPossibleAttacks(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    // Для короля атаки совпадают с ходами
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
    return "стандартное";
  }

  protected getMovementRange(): number {
    return 1;
  }

  protected getAttackType(): string {
    return "обычная";
  }

  protected getAttackRange(): number {
    return 1;
  }

  protected getPieceSkills() {
    const baseSkills = [
      {
        name: "Базовая атака",
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