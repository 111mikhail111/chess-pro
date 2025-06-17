import { Board } from "./Board";
import { Piece } from "./Piece";
import type { BoardPosition } from "./Board";

export class AiLogic {
  private board: Board;
  private maxDepth: number;
  private player: number; // Игрок, за которого играет ИИ (обычно 2)

  constructor(board: Board, player: number = 2, maxDepth: number = 3) {
    this.board = board;
    this.player = player;
    this.maxDepth = maxDepth;
  }

  // Основной метод для вычисления лучшего хода
  computeBestMove(): { from: BoardPosition; to: BoardPosition } | null {
    const possibleMoves = this.getAllPossibleMoves(this.player);
    if (possibleMoves.length === 0) return null;

    let bestMove = null;
    let bestValue = -Infinity;

    // Оцениваем каждый возможный ход
    for (const move of possibleMoves) {
      // Делаем ход на копии доски
      const boardCopy = this.deepCopyBoard();
      boardCopy.handleClick(move.from);
      boardCopy.handleClick(move.to);

      // Оцениваем позицию после этого хода
      const moveValue = this.minimax(
        boardCopy,
        this.maxDepth - 1,
        -Infinity,
        Infinity,
        false
      );

      // Обновляем лучший ход, если нашли лучше
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Алгоритм Minimax с альфа-бета отсечением
  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    // Проверяем терминальное состояние (конец игры или глубина = 0)
    if (depth === 0 || this.isGameOver(board)) {
      return this.evaluateBoard(board);
    }

    const currentPlayer = isMaximizing ? this.player : 3 - this.player; // 3 - player = противник

    if (isMaximizing) {
      let maxEval = -Infinity;
      const moves = this.getAllPossibleMoves(currentPlayer, board);

      for (const move of moves) {
        const boardCopy = this.deepCopyBoard(board);
        boardCopy.handleClick(move.from);
        boardCopy.handleClick(move.to);

        const evalResult = this.minimax(
          boardCopy,
          depth - 1,
          alpha,
          beta,
          false
        );
        maxEval = Math.max(maxEval, evalResult);
        alpha = Math.max(alpha, evalResult);
        if (beta <= alpha) break; // Альфа-бета отсечение
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      const moves = this.getAllPossibleMoves(currentPlayer, board);

      for (const move of moves) {
        const boardCopy = this.deepCopyBoard(board);
        boardCopy.handleClick(move.from);
        boardCopy.handleClick(move.to);

        const evalResult = this.minimax(
          boardCopy,
          depth - 1,
          alpha,
          beta,
          true
        );
        minEval = Math.min(minEval, evalResult);
        beta = Math.min(beta, evalResult);
        if (beta <= alpha) break; // Альфа-бета отсечение
      }
      return minEval;
    }
  }

  // Получаем все возможные ходы для игрока
  private getAllPossibleMoves(
    player: number,
    board: Board = this.board
  ): Array<{ from: BoardPosition; to: BoardPosition }> {
    const moves: Array<{ from: BoardPosition; to: BoardPosition }> = [];

    // Перебираем все клетки доски
    for (let y = 0; y < board.gridSize; y++) {
      for (let x = 0; x < board.gridSize; x++) {
        const piece = board.pieces[y][x];
        if (piece && piece.owner === player) {
          const from = { x, y };

          // Получаем возможные ходы и атаки
          const possibleMoves = piece.getPossibleMoves(board.pieces, from);
          const possibleAttacks = piece.getPossibleAttacks(board.pieces, from);

          // Добавляем ходы
          for (const move of possibleMoves) {
            moves.push({ from, to: move });
          }

          // Добавляем атаки
          for (const attack of possibleAttacks) {
            // Проверяем, что это действительно атака (не дублируется с ходом)
            const target = board.pieces[attack.y][attack.x];
            if (
              (target && target.owner !== player) ||
              (attack.x === board.castlePos[1].x &&
                attack.y === board.castlePos[1].y &&
                player !== 1) ||
              (attack.x === board.castlePos[2].x &&
                attack.y === board.castlePos[2].y &&
                player !== 2)
            ) {
              moves.push({ from, to: attack });
            }
          }
        }
      }
    }

    return moves;
  }

  // Оценка текущего состояния доски
  private evaluateBoard(board: Board): number {
    let score = 0;

    // 1. Оценка фигур
    for (let y = 0; y < board.gridSize; y++) {
      for (let x = 0; x < board.gridSize; x++) {
        const piece = board.pieces[y][x];
        if (piece) {
          const pieceValue = this.getPieceValue(piece);
          score += piece.owner === this.player ? pieceValue : -pieceValue;
        }
      }
    }

    // 2. Оценка замков
    score += board.castleHP[this.player] * 0.1; // Замок своего игрока
    score -= board.castleHP[3 - this.player] * 0.1; // Замок противника

    // 3. Оценка позиции короля (ближе к центру - лучше)
    const kingPos = this.findKing(board, this.player);
    if (kingPos) {
      const centerDistance = this.distanceToCenter(kingPos, board.gridSize);
      score -= centerDistance * 0.5; // Чем меньше расстояние, тем лучше
    }

    // 4. Оценка количества доступных ходов
    const mobility = this.getAllPossibleMoves(this.player, board).length;
    score += mobility * 0.2;

    return score;
  }

  // Значение фигуры для оценки
  private getPieceValue(piece: Piece): number {
    const baseValues: Record<Piece["type"], number> = {
      king: 1000, // Король очень важен
      pawn: 10,
      knight: 30,
      archer: 25,
      cannon: 35,
      mage: 20,
    };

    // Учитываем уровень и здоровье фигуры
    return baseValues[piece.type] + piece.hp * 0.5 + piece.attack * 0.3;
  }

  // Поиск короля на доске
  private findKing(board: Board, player: number): BoardPosition | null {
    for (let y = 0; y < board.gridSize; y++) {
      for (let x = 0; x < board.gridSize; x++) {
        const piece = board.pieces[y][x];
        if (piece && piece.type === "king" && piece.owner === player) {
          return { x, y };
        }
      }
    }
    return null;
  }

  // Расстояние до центра доски
  private distanceToCenter(pos: BoardPosition, gridSize: number): number {
    const center = (gridSize - 1) / 2;
    return Math.sqrt(Math.pow(pos.x - center, 2) + Math.pow(pos.y - center, 2));
  }

  // Проверка окончания игры
  private isGameOver(board: Board): boolean {
    // Проверяем HP замков
    if (board.castleHP[1] <= 0 || board.castleHP[2] <= 0) {
      return true;
    }

    // Проверяем наличие королей
    const king1 = this.findKing(board, 1);
    const king2 = this.findKing(board, 2);
    return !king1 || !king2;
  }

  // Глубокое копирование доски (упрощенная версия)
  private deepCopyBoard(sourceBoard: Board = this.board): Board {
    // В реальной реализации нужно полностью клонировать состояние доски
    // Это упрощенная версия для демонстрации
    const newBoard = new Board(sourceBoard.scene);
    newBoard.currentPlayer = sourceBoard.currentPlayer;
    newBoard.movesLeft = sourceBoard.movesLeft;

    // Копируем фигуры
    for (let y = 0; y < sourceBoard.gridSize; y++) {
      for (let x = 0; x < sourceBoard.gridSize; x++) {
        const piece = sourceBoard.pieces[y][x];
        if (piece) {
          // В реальной реализации нужно создать новые экземпляры фигур
          newBoard.pieces[y][x] = piece;
        }
      }
    }

    // Копируем состояние замков
    newBoard.castleHP = { ...sourceBoard.castleHP };
    newBoard.castlePos = { ...sourceBoard.castlePos };

    return newBoard;
  }
}
