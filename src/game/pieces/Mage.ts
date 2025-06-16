import { Piece, type BoardPosition } from "../Piece";

export class Mage extends Piece {
  constructor(owner: number) {
    super("mage", owner);
  }

  getPossibleMoves(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    // Маг ходит как король, на 1 клетку в любом направлении
    const moves: BoardPosition[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; // Не текущая позиция

        const nx = position.x + dx;
        const ny = position.y + dy;

        if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
          if (board[ny][nx] === null || board[ny][nx]?.owner !== this.owner) {
            moves.push({ x: nx, y: ny });
          }
        }
      }
    }
    return moves;
  }

  getPossibleAttacks(
    board: (Piece | null)[][],
    position: BoardPosition
  ): BoardPosition[] {
    const attacks: BoardPosition[] = [];
    // Атака по площади 2x2 в радиусе 3 (изменено с 5 для более разумного баланса, но можно вернуть 5)
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue; // Не текущая позиция

        const distance = Math.abs(dx) + Math.abs(dy); // Манхэттенское расстояние
        if (distance <= 3) {
          // Радиус атаки
          const nx = position.x + dx;
          const ny = position.y + dy;

          if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
            attacks.push({ x: nx, y: ny });
          }
        }
      }
    }
    return attacks;
  }

  // Маг атакует крестиком
  attackTarget(
    attackerPos: BoardPosition,
    defenderPos: BoardPosition,
    boardPieces: (Piece | null)[][],
    castleHP: { [key: number]: number },
    castlePos: { [key: number]: BoardPosition }
  ): boolean {
    let kingKilled = false;

    // Цели атаки мага (крестиком вокруг defenderPos)
    const attackPoints = [
      defenderPos,
      { x: defenderPos.x + 1, y: defenderPos.y },
      { x: defenderPos.x - 1, y: defenderPos.y },
      { x: defenderPos.x, y: defenderPos.y + 1 },
      { x: defenderPos.x, y: defenderPos.y - 1 },
    ];

    attackPoints.forEach((point) => {
      if (
        point.x < 0 ||
        point.x >= boardPieces[0].length ||
        point.y < 0 ||
        point.y >= boardPieces.length
      )
        return;

      const target = boardPieces[point.y][point.x];
      if (target && target.owner !== this.owner) {
        target.hp -= this.attack;
        if (target.hp <= 0) {
          boardPieces[point.y][point.x] = null;
          if (target.type === "king") {
            alert(`👑 Игрок ${this.owner} победил, убив короля!`);
            kingKilled = true;
          }
        }
      }
      // Маг также может атаковать замки
      else if (
        (point.x === castlePos[1].x &&
          point.y === castlePos[1].y &&
          this.owner !== 1) ||
        (point.x === castlePos[2].x &&
          point.y === castlePos[2].y &&
          this.owner !== 2)
      ) {
        const targetCastleOwner =
          point.x === castlePos[1].x && point.y === castlePos[1].y ? 1 : 2;
        castleHP[targetCastleOwner] -= this.attack;
        if (castleHP[targetCastleOwner] <= 0) {
          alert(`🔥 Игрок ${this.owner} победил, уничтожив замок игрока ${targetCastleOwner}!`);
          kingKilled = true; // Используем эту переменную для обозначения конца игры
        }
      }
    });
    return kingKilled;
  }
}