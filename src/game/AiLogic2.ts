import type { BoardPosition } from "./Board";
import { Piece } from "./Piece";

export class AiLogic2 {
  player: number; // 2 для черных, 1 для белых
  board: any; // Board

  constructor(player: number, board: any) {
    this.player = player;
    this.board = board;
  }

  /**
   * Возвращает лучший ход для текущей позиции.
   * Приоритет: атака короля > атака замка > атака фигуры > обычный ход.
   */
  async computeBestMove(): Promise<{ from: BoardPosition; to: BoardPosition } | null> {
    console.log("Доска", this.board);
    let bestMove: { from: BoardPosition; to: BoardPosition } | null = null;
    let bestScore = -Infinity;

    // Собираем все свои фигуры
    for (let y = 0; y < this.board.gridSize; y++) {
      for (let x = 0; x < this.board.gridSize; x++) {
        const piece: Piece | null = this.board.pieces[y][x];
        if (!piece || piece.owner !== this.player) continue;

        const from: BoardPosition = { x, y };

        // 1. Атаки
        const attacks = piece.getPossibleAttacks(this.board.pieces, from);
        for (const to of attacks) {
          const target = this.board.getPieceAt(to);

          // Атака короля
          if (target && target.type === "king" && target.owner !== this.player) {
            return { from, to }; // Немедленно атакуем короля
          }

          // Атака замка
          if (
            (to.x === this.board.castlePos[1].x && to.y === this.board.castlePos[1].y && this.player !== 1) ||
            (to.x === this.board.castlePos[2].x && to.y === this.board.castlePos[2].y && this.player !== 2)
          ) {
            return { from, to }; // Немедленно атакуем замок
          }

          // Атака фигуры — приоритет по урону/ценности
          if (target && target.owner !== this.player) {
            // Чем больше у цели HP и атака — тем выгоднее
            const score = 100 + target.hp + target.attack;
            if (score > bestScore) {
              bestScore = score;
              bestMove = { from, to };
            }
          }
        }

        // 2. Обычные ходы
        const moves = piece.getPossibleMoves(this.board.pieces, from);
        for (const to of moves) {
          // Не ходим на свои фигуры
          const target = this.board.getPieceAt(to);
          if (target && target.owner === this.player) continue;

          // Можно добавить простую эвристику: например, двигаться ближе к замку противника
          let score = 0;
          const enemyCastle = this.player === 1 ? this.board.castlePos[2] : this.board.castlePos[1];
          score -= Math.abs(to.x - enemyCastle.x) + Math.abs(to.y - enemyCastle.y);

          if (score > bestScore) {
            bestScore = score;
            bestMove = { from, to };
          }
        }
      }
    }

    return bestMove;
  }
}