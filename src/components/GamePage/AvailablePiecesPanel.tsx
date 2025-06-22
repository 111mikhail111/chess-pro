import React from "react";
import styles from "./AvailablePiecesPanel.module.css";
import { useUser } from "../../contexts/UserContext";

type Piece = {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  isUnlocked: boolean;
  currentLevel?: number;
  price: number;
};

interface AvailablePiecesPanelProps {
  pieces: Piece[];
  onSelectPiece: (piece: Piece) => void;
  selectedPieceType: string | null;
  remainingPoints: number; // <--- ДОБАВЛЕНО НОВОЕ СВОЙСТВО
}

const AvailablePiecesPanel: React.FC<AvailablePiecesPanelProps> = ({
  pieces,
  onSelectPiece,
  selectedPieceType,
  remainingPoints, // <--- ИСПОЛЬЗУЕМ ЕГО
}) => {
  console.log(pieces);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Доступные фигуры</h2>
      <div className={styles.piecesGrid}>
        {pieces.map((piece) => {
          if (!piece.isUnlocked) return null;

          const isAffordable = piece.price <= remainingPoints;
          const isSelected = selectedPieceType === piece.type;

          return (
            <div
              key={piece.id} //
              className={`${styles.pieceItem} ${
                isSelected ? styles.selected : "" //
              } ${!isAffordable ? styles.unaffordable : ""}`} // Добавляем класс, если не хватает очков
              onClick={() => isAffordable && onSelectPiece(piece)}
            >
              {!isAffordable && (
                <span className={styles.pointsWarning}>
                  {remainingPoints}/{piece.price}
                </span>
              )}
              <div className={styles.pieceImageContainer}>
                {piece.type ? (
                  <img
                    src={piece.imageUrl || `/sprites/${piece.type}_white.png`}
                    alt={piece.name}
                    className={styles.pieceImage}
                  />
                ) : (
                  <div className={styles.pieceImagePlaceholder}>
                    {piece.type.charAt(0).toUpperCase()}
                  </div>
                )}
                {isSelected && (
                  <div className={styles.selectionIndicator}>
                    <div className={styles.pulseEffect} />
                  </div>
                )}
              </div>
              <div className={styles.pieceInfo}>
                <span className={styles.pieceName}>{piece.name}</span>
                <div className={styles.pieceDetails}>
                  {piece.currentLevel && (
                    <span className={styles.pieceLevel}>
                      Ур. {piece.currentLevel}
                    </span>
                  )}
                  <span
                    className={`${styles.piecePrice} ${
                      !isAffordable ? styles.unaffordablePrice : ""
                    }`}
                  >
                    {piece.price} очк.
                  </span>
                </div>
              </div>
              {!piece.isUnlocked && (
                <div className={styles.lockOverlay}>
                  <span className={styles.lockIcon}>🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailablePiecesPanel;
