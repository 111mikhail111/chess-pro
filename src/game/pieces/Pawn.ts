import { Piece, type BoardPosition } from "../Piece";

export class Pawn extends Piece {
  constructor(owner: number) {
    super("pawn", owner);
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
}
