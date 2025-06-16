import React from "react";
import styles from "./InfoBlock.module.css";

interface InfoBlockProps {
  currentPlayer: "white" | "black";
  movesLeft: number;
  whiteTime: string;
  blackTime: string;
  moveHistory: string[];
}

function InfoBlock({
  currentPlayer = "white",
  movesLeft = 3,
  whiteTime = "05:23",
  blackTime = "03:45",
  moveHistory = ["e2-e4", "e7-e5", "g1-f3", "b8-c6"],
}: InfoBlockProps) {
  return (
    <div className={styles.infoBlock}>
      <h2 className={styles.title}>Информация об игре</h2>
      
      <div className={styles.gameObjective}>
        <h3>Цель игры:</h3>
        <p>Разрушить замок или уничтожить короля</p>
      </div>
      
      <div className={styles.turnInfo}>
        <h3>Текущий ход:</h3>
        <div className={`${styles.playerIndicator} ${styles[currentPlayer]}`}>
          {currentPlayer === "white" ? "Белые" : "Чёрные"}
        </div>
      </div>
      
      <div className={styles.movesLeft}>
        <h3>Осталось ходов:</h3>
        <div className={styles.movesCount}>{movesLeft}</div>
      </div>
      
      <div className={styles.timeControls}>
        <h3>Время:</h3>
        <div className={styles.timeDisplay}>
          <span className={`${styles.time} ${styles.whiteTime}`}>
            Белые: {whiteTime}
          </span>
          <span className={`${styles.time} ${styles.blackTime}`}>
            Чёрные: {blackTime}
          </span>
        </div>
      </div>
      
      <div className={styles.moveHistory}>
        <h3>История ходов:</h3>
        <div className={styles.movesList}>
          {moveHistory.map((move, index) => (
            <div key={index} className={styles.move}>
              {index + 1}. {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InfoBlock;