import { Piece, type BoardPosition } from "../Piece";

export class Cannon extends Piece {
  constructor(owner: number) {
    super("cannon", owner);
  }

  getPossibleMoves(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const d of directions) {
      for (let i = 1; i <= 3; i++) {
        const nx = position.x + d.x * i;
        const ny = position.y + d.y * i;

        if (nx < 0 || nx >= board[0].length || ny < 0 || ny >= board.length)
          break;
        else {
          const piece = board[ny][nx];
          if (piece != null) {
            if (piece.owner == this.owner) {
              break; // Упираемся в свою фигуру
            } else {
              moves.push({ x: nx, y: ny }); // Можем атаковать фигуру противника
              break; // После атаки останавливаемся
            }
          }
          moves.push({ x: nx, y: ny }); // Пустая клетка, можем идти
        }
      }
    }
    return moves;
  }

  getPossibleAttacks(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    // Для пушки атаки совпадают с ходами, которые заканчиваются на фигуре противника
    return this.getPossibleMoves(board, position).filter((move) => {
      const targetPiece = board[move.y][move.x];
      return targetPiece && targetPiece.owner !== this.owner;
    });
  }

  protected calculateDamage(
    attackerPos: BoardPosition,
    defenderPos: BoardPosition,
    defender: Piece
  ): number {
    const distance =
      Math.abs(attackerPos.x - defenderPos.x) +
      Math.abs(attackerPos.y - defenderPos.y);
    if (distance === 0) return 0;
    if (distance === 1) return this.attack * 2;
    if (distance === 2) return this.attack * 1.5;
    return this.attack * 1;
  }
}
