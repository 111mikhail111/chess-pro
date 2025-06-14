import { type BoardPosition } from "./Board";

export type PieceType = "king" | "pawn" | "knight" | "archer" | "cannon" | "mage";

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

    // Всё равно даём HP и атаку
    if (type === "king") {
      this.hp = 30;
      this.attack = 10;
    } else if (type === "pawn") {
      this.hp = 10;
      this.attack = 5;
    } else if (type == "cannon") {
      this.hp = 10;
      this.attack = 5;
    } else if (type == "knight") {
      this.hp = 15;
      this.attack = 7;
    } else if (type == "archer") {
      this.hp = 12;
      this.attack = 6;
    } else if (type == "mage") {
      this.hp = 5;
      this.attack = 3;
    } 
    else {
      this.hp = 0;
      this.attack = 0;
    }
  }

  getPossibleMoves(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];

    if (this.type === "cannon") {
      // Пушка ходит по прямым до 3 клеток
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
                break;
              } else {
                moves.push({ x: nx, y: ny });
                break;
              }
            }
            moves.push({ x: nx, y: ny });
          }
        }
      }

      return moves;
    }
    if (this.type === "knight") {
      // Ходы конём буквой "Г"
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

        // Можно перейти, если поле пустое или занято противником
        if (board[ny][nx] == null || board[ny][nx]?.owner !== this.owner) {
          moves.push({ x: nx, y: ny });
        }
      }

      return moves;
    }
    if (this.type === "archer") {
      // Ходы как у короля
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
    
   
    

    // Всё равно даём варианты для других фигур
    // (например, короля, пешки...)
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

      if (nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && board[ny][nx]?.owner !== this.owner) {
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

    if (this.type === "archer") {
      // Атака по прямым, но на дистанции до 3
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

          // Если поле заполнено, можем атаковать и прекращаем
          if (board[ny][nx] == null) continue;

          if (board[ny][nx]?.owner !== this.owner) {
            attacks.push({ x: nx, y: ny });
          }
          break;
        }
      }
    }
    if (this.type === "mage") {
      // Атака по площади 2x2 в радиусе 5
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dy === 0) continue;

          if (Math.abs(dx) + Math.abs(dy) <= 5) {
            // В центре области 2x2
            const nx = position.x + dx;
            const ny = position.y + dy;

            if (nx >= 0 &&
                nx < board.length &&
                ny >= 0 &&
                ny < board.length 
                ) {

              attacks.push({ x: nx, y: ny });
            }
          }
        }
      }
    }

    return attacks;
  }

  attackDamage(attackerPos: BoardPosition, defenderPos: BoardPosition) {
    if (this.type === "cannon") {
      // Расстояние по прямой
      const distance =
        Math.abs(attackerPos.x - defenderPos.x) +
        Math.abs(attackerPos.y - defenderPos.y);
      if (distance === 0) return 0;
      if (distance === 1) return this.attack * 2;
      if (distance === 2) return this.attack * 1.5;
      return this.attack * 1;
    }
    
    return this.attack;
  }
}
