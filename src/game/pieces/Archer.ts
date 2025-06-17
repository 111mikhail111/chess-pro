import { Piece, type BoardPosition } from "../Piece";

export class Archer extends Piece {
  constructor(owner: number) {
    super("archer", owner);
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
    const attacks: BoardPosition[] = [];
    const directions = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
    ];

    for (const d of directions) {
      for (let i = 1; i <= 3; i++) {
        const nx = position.x + d.dx * i;
        const ny = position.y + d.dy * i;

        if (nx < 0 || nx >= board[0].length || ny < 0 || ny >= board.length) {
          break;
        }

        const targetPiece = board[ny][nx];
        if (targetPiece) {
          if (targetPiece.owner !== this.owner) {
            attacks.push({ x: nx, y: ny });
          }
          break; // Атака только до первой фигуры
        }
      }
    }
    return attacks;
  }

  protected getMovementType(): string {
    return "Обычное передвижение в радиусе одной клетки";
  }

  protected getMovementRange(): number {
    return 2;
  }

  protected getAttackType(): string {
    return "Дистанционная атака из лука по вертикали, горизонтали и диагонали";
  }

  protected getAttackRange(): number {
    return 3;
  }

  protected getPieceSkills() {
    const baseSkills = super.getPieceSkills();
    /*
    baseSkills.push(
      {
        name: "Точный выстрел",
        description: "Увеличивает урон на 50% на следующую атаку",
        cooldown: 2,
      },
      {
        name: "Дождь стрел",
        description: "Атакует все цели в радиусе 2 клеток",
        cooldown: 4,
      }
    );*/
    return baseSkills;
  }
}
