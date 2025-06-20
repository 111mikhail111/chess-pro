import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LevelsPage.module.css";
import { useUser } from "../contexts/UserContext";

interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  boardConfig: {
    initialPieces: Array<{
      type: string;
      owner: number;
      x: number;
      y: number;
    }>;
  };
  reward: {
    experience: number;
    pieces: number[];
  };
  isAvailable: boolean;
}

const LevelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useUser();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/levels/all", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.userId, // сюда передаешь свой userId
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Уровни загружены:", data.levels);
        setLevels(data.levels);
      } catch (err) {
        console.error("Ошибка загрузки уровней:", err);
        setError("Не удалось загрузить уровни");
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [user]);

  const startLevel = async (levelId: number) => {
    try {
      const response = await fetch("/api/levels/byid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: levelId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const levelData = data.level;

      navigate("/", {
        state: {
          level: {
            ...levelData,
            initialPieces: levelData.boardConfig.initialPieces,
          },
        },
      });
    } catch (err) {
      console.error("Ошибка загрузки уровня:", err);
      setError("Не удалось начать уровень");
    }
  };

  if (loading) {
    return <div className={styles.container}>Загрузка уровней...</div>;
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.levelsContainer}>
        <h1 className={styles.title}>Выберите уровень</h1>
        <div className={styles.levelsGrid}>
          {levels.map((level) => (
            <div
              key={level.id}
              className={`${styles.levelCard} ${
                !level.isAvailable ? styles.disabled : ""
              }`}
              onClick={() => level.isAvailable && startLevel(level.id)}
            >
              <h3>{level.name}</h3>
              <p>{level.description || `Сложность: ${level.difficulty}`}</p>
              <div
                className={`${styles.difficultyBadge} ${
                  styles[`difficulty${level.difficulty}`]
                }`}
              >
                {level.difficulty}
              </div>
              {!level.isAvailable && <div className={styles.locked}>🔒</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;
