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
}