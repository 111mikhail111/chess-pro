import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { MainScene } from "../game/MainScene"; // Путь к вашей сцене
import InfoBlock from "./GamePage/InfoBlock";
import SelectedPieceBlock from "./GamePage/SelectedPieceBlock";
import styles from "./GamePage.module.css";
import EventBus from "../game/EventBus";
import { useLocation } from "react-router-dom";
import GameOverModal from "./GamePage/GameOverModal";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface GameState {
  currentPlayer: "white" | "black";
  movesLeft: number;
  whiteTime: string;
  blackTime: string;
  moveHistory: string[];
}

interface Level {
  id: number;
  name: string;
  initialPieces: Array<{
    type: string;
    owner: number;
    x: number;
    y: number;
  }>;
}

interface LocationState {
  level?: Level;
}

const GamePage: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null); // Ссылка на div, куда будет вставляться игра Phaser

  const { user } = useUser();
  console.log("User data in gamepage:", user);
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: "white",
    movesLeft: 3,
    whiteTime: "1:30",
    blackTime: "1:45",
    moveHistory: [],
  });

  const [selectedPiece, setSelectedPiece] = useState<any>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);

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
    const handleMoveRecorded = (moveDescription: string) => {
      setGameState((prev) => ({
        ...prev,
        moveHistory: [...prev.moveHistory, moveDescription].slice(-50), // Ограничиваем историю 50 ходами
      }));
    };

    EventBus.on("move-recorded", handleMoveRecorded);

    return () => {
      EventBus.off("move-recorded", handleMoveRecorded);
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 800,
        parent: gameRef.current,
        scene: [MainScene],
      };

      const game = new Phaser.Game(config);

      setTimeout(() => {
        const locationState = location.state as LocationState;
        const levelData = locationState?.level;

        if (levelData) {
          setCurrentLevelId(levelData.id); // Сохраняем id уровня
          console.log("Эмитим данные уровня:", levelData);
          EventBus.emit("load-level", levelData);
        }
      }, 500);

      return () => {
        game.destroy(true);
      };
    }
  }, [location.state]);

  const [gameOver, setGameOver] = useState<{
    isOpen: boolean;
    isWin: boolean;
  }>({ isOpen: false, isWin: false });

  useEffect(() => {
    if (user == null) return;
    const handleGameOver = async (result: {
      isWin: boolean;
      levelId?: number;
    }) => {
      setGameOver({ isOpen: true, isWin: result.isWin });
      console.log("Game over:", result);
      if (result.isWin && result.levelId) {
        try {
          await completeLevel(result.levelId);
          console.log("Level marked as completed");
        } catch (error) {
          console.error("Failed to mark level as completed:", error);
          // Можно добавить уведомление пользователю об ошибке
        }
      }
    };

    EventBus.on("game-over", handleGameOver);

    return () => {
      EventBus.off("game-over", handleGameOver);
    };
  }, [user]);

  const handleRestart = () => {
    setGameOver({ isOpen: false, isWin: false });
    // Перезапуск игры
    EventBus.emit("restart-game");
  };

  const handleBackToLevels = () => {
    navigate("/levels"); // Предполагается, что у вас есть маршрут /levels
  };

  const completeLevel = async (levelId: number) => {
    console.log("Completing level:", levelId, "user:", user?.userId);
    if (!user?.userId) {
      console.log("User is not authenticated");
      return;
    }

    try {
      const response = await fetch("/api/levels/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ levelId, userId: user?.userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error completing level:", error);
      throw error;
    }
  };

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
      <GameOverModal
        isOpen={gameOver.isOpen}
        isWin={gameOver.isWin}
        onRestart={handleRestart}
        onBackToLevels={handleBackToLevels}
        levelId={currentLevelId ?? 0}
      />
    </>
  );
};

export default GamePage;
