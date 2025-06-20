// GameOverModal.tsx
import React from "react";
import styles from "./GameOverModal.module.css";
import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";

interface RewardItem {
  item_id: number;
  name: string;
  image_url: string;
  rarity: string;
  amount: number;
}

interface GameOverModalProps {
  isOpen: boolean;
  isWin: boolean;
  levelId: number; // ⬅️ добавили
  onRestart: () => void;
  onBackToLevels: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isWin,
  onRestart,
  onBackToLevels,
  levelId,
}) => {
  if (!isOpen) return null;
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const {user} = useUser();

  useEffect(() => {
    const fetchRewards = async () => {
      if (!isWin || !isOpen) return;

      try {
        console.log("Fetching rewards...", levelId, user?.userId);
        const res = await fetch(`/api/level-rewards/${levelId}/user/${user?.userId}`);
        const data = await res.json();
        console.log("Rewards fetched:", data);
        setRewards(data); // массив с { item_id, name, image_url, rarity, amount }
      } catch (err) {
        console.error("Ошибка при получении наград:", err);
      }
    };

    fetchRewards();
  }, [isWin, isOpen, levelId, user]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{isWin ? "Победа!" : "Поражение"}</h2>

        {isWin && rewards && rewards.length > 0 && (
          <div className={styles.rewardsSection}>
            <h3>Полученные награды:</h3>
            <div className={styles.rewardsGrid}>
              {rewards.map((reward) => (
                <div
                  key={reward.item_id}
                  className={`${styles.rewardItem} ${styles[reward.rarity]}`}
                >
                  <img
                    src={`/materials/${reward.image_url}`}
                    alt={reward.name}
                    className={styles.rewardImage}
                  />
                  <div className={styles.rewardInfo}>
                    <span className={styles.rewardName}>{reward.name}</span>
                    <span className={styles.rewardAmount}>
                      x{reward.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.modalButtons}>
          <button onClick={onRestart}>Попробовать еще раз</button>
          <button onClick={onBackToLevels}>Назад к уровням</button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
