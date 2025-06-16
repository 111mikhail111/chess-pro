import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { MainScene } from "../game/MainScene"; // Путь к вашей сцене
import InfoBlock from "./GamePage/InfoBlock";
import SelectedPieceBlock from "./GamePage/SelectedPieceBlock";
import styles from "./GamePage.module.css";
import EventBus from "../game/EventBus";

interface GameState {
  currentPlayer: "white" | "black";
  movesLeft: number;
  whiteTime: string;
  blackTime: string;
  moveHistory: string[];
}

const GamePage: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null); // Ссылка на div, куда будет вставляться игра Phaser

  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: "white",
    movesLeft: 3,
    whiteTime: "1:30",
    blackTime: "1:45",
    moveHistory: [],
  });

  const [selectedPiece, setSelectedPiece] = useState<any>(null);

  useEffect(() => {
    const handleGameUpdate = (data: any) => {
      setGameState((prev) => ({
        ...prev,
        currentPlayer: data.currentPlayer === 1 ? "white" : "black",
        movesLeft: data.movesLeft,
      }));
    };

    const handlePieceSelected = (pieceData: any) => {
      console.log("Piece selected:", pieceData); // Логируем данные
      try {
        setSelectedPiece({
          ...pieceData,
          movement: pieceData.movement || { type: "unknown", range: 0 },
          attack: pieceData.attack || { type: "unknown", range: 0, damage: 0 },
          skills: pieceData.skills || [],
        });
      } catch (error) {
        console.error("Error processing piece data:", error);
      }
    };

    EventBus.on("game-update", handleGameUpdate);
    EventBus.on("piece-selected", handlePieceSelected);

    return () => {
      EventBus.off("game-update", handleGameUpdate);
      EventBus.off("piece-selected", handlePieceSelected);
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 680,
        height: 680,
        parent: gameRef.current, // Используем useRef для привязки к конкретному div
        scene: [MainScene],
      };
      const game = new Phaser.Game(config);

      // Очистка Phaser игры при размонтировании компонента
      return () => {
        game.destroy(true);
      };
    }
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sidePanel}>
          <InfoBlock
            currentPlayer={gameState.currentPlayer}
            movesLeft={gameState.movesLeft}
            whiteTime={gameState.whiteTime}
            blackTime={gameState.blackTime}
            moveHistory={gameState.moveHistory}
          />
        </div>

        <div className={styles.mainContent}>
          <div
            id="phaser-game-container"
            ref={gameRef}
            className={styles.gameCanvas}
          />
        </div>

        <div className={styles.sidePanel}>
          <SelectedPieceBlock piece={selectedPiece} />
        </div>
      </div>
    </>
  );
};

export default GamePage;
