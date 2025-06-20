import * as Pieces from './pieces';

export const PieceRegistry = {
  king: Pieces.King,
  pawn: Pieces.Pawn,
  knight: Pieces.Knight,
  archer: Pieces.Archer,
  cannon: Pieces.Cannon,
  mage: Pieces.Mage,
} as const;