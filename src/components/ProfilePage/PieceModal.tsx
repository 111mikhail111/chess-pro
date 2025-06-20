import React, { useState, useEffect } from "react";
import styles from "./PieceModal.module.css";
import { useUser } from "../../contexts/UserContext";

interface PieceLevelInfo {
  level: number;
  health: number;
  attack: number;
  unlock_skill?: string;
  upgrade_cost?: any;
}

interface PieceModalProps {
  piece: {
    id: number;
    name: string;
    type: string;
    imageUrl: string;
    currentLevel: number;
  };
  levels: PieceLevelInfo[];
  onClose: () => void;
  onUpgrade: (newLevel: number) => void;
}

const PieceModal: React.FC<PieceModalProps> = ({ 
  piece, 
  levels, 
  onClose, 
  onUpgrade 
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [statHighlight, setStatHighlight] = useState<"health" | "attack" | null>(null);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const currentStats = levels.find((lvl) => lvl.level === piece.currentLevel);
  const nextStats = levels.find((lvl) => lvl.level === piece.currentLevel + 1);
  const { user } = useUser();

  // Генерация частиц с разными свойствами
  const particles = Array(30).fill(0).map((_, i) => ({
    id: i,
    x: Math.random() * 2 - 0.5, // Разлет в разные стороны
    y: Math.random() * 2 - 0.5,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    duration: Math.random() * 0.7 + 0.8,
    color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)` // Золотистые оттенки
  }));

  const handleUpgrade = async () => {
    if (isUpgrading) return;
    
    setIsUpgrading(true);
    try {
      const res = await fetch(`/api/pieces/${piece.id}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      // Запускаем анимации
      setNewLevel(data.newLevel);
      setShowAnimation(true);
      setShowLevelUp(true);
      
      // Подсвечиваем увеличенные характеристики
      if (nextStats) {
        if (nextStats.health > (currentStats?.health || 0)) {
          setTimeout(() => setStatHighlight("health"), 500);
        }
        if (nextStats.attack > (currentStats?.attack || 0)) {
          setTimeout(() => setStatHighlight("attack"), 700);
        }
      }

      setTimeout(() => {
        setShowAnimation(false);
        setShowLevelUp(false);
        setStatHighlight(null);
        onUpgrade(data.newLevel);
        setNewLevel(null);
      }, 1500);
      
    } catch (err: any) {
      alert(`❌ Не удалось прокачать: ${err.message}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  // Анимация цифры уровня
  const LevelNumber: React.FC<{ level: number }> = ({ level }) => {
    const [displayLevel, setDisplayLevel] = useState(level);
    
    useEffect(() => {
      if (newLevel && newLevel > level) {
        const interval = setInterval(() => {
          setDisplayLevel(prev => {
            const next = prev + 1;
            return next > newLevel ? newLevel : next;
          });
        }, 100);
        
        return () => clearInterval(interval);
      }
    }, [newLevel, level]);

    return <>{displayLevel}</>;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.title}>{piece.name}</h2>
        
        <div className={styles.pieceImageContainer}>
          {showLevelUp && <div className={styles.levelUpEffect} />}
          
          <div className={`${styles.pieceImageWrapper} ${showAnimation ? styles.upgradeAnimation : ''}`}>
            <img
              src={piece.imageUrl || `/sprites/${piece.type}_white.png`}
              alt={piece.name}
              className={styles.pieceImage}
            />
            {showAnimation && (
              <div className={styles.crownEffect}>
                <div className={styles.crownPart} style={{ '--i': 0 } as React.CSSProperties} />
                <div className={styles.crownPart} style={{ '--i': 1 } as React.CSSProperties} />
                <div className={styles.crownPart} style={{ '--i': 2 } as React.CSSProperties} />
                <div className={styles.crownPart} style={{ '--i': 3 } as React.CSSProperties} />
                <div className={styles.crownPart} style={{ '--i': 4 } as React.CSSProperties} />
              </div>
            )}
          </div>
          
          {showAnimation && (
            <div className={styles.upgradeParticles}>
              {particles.map((p) => (
                <div 
                  key={p.id}
                  className={styles.particle}
                  style={{
                    '--random-x': p.x,
                    '--random-y': p.y,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                    left: '50%',
                    top: '50%',
                    backgroundColor: p.color,
                    boxShadow: `0 0 ${p.size}px ${p.size/2}px ${p.color}`
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>

        <p className={styles.levelDisplay}>
          Текущий уровень: <strong>
            <LevelNumber level={piece.currentLevel} />
          </strong>
          {newLevel && newLevel > piece.currentLevel && (
            <span className={styles.levelUpArrow}> → <LevelNumber level={newLevel} /></span>
          )}
        </p>

        {currentStats && (
          <div className={styles.stats}>
            <p className={statHighlight === "health" ? styles.statIncrease : ''}>
              <span className={styles.statIcon}>🛡</span> Здоровье:{" "}
              {currentStats.health}
              {nextStats && nextStats.health > currentStats.health && (
                <span className={styles.statDiff}> → {nextStats.health}</span>
              )}
            </p>
            <p className={statHighlight === "attack" ? styles.statIncrease : ''}>
              <span className={styles.statIcon}>⚔</span> Атака:{" "}
              {currentStats.attack}
              {nextStats && nextStats.attack > currentStats.attack && (
                <span className={styles.statDiff}> → {nextStats.attack}</span>
              )}
            </p>
            {currentStats.unlock_skill && (
              <p>
                <span className={styles.statIcon}>🔓</span> Навык:{" "}
                {currentStats.unlock_skill}
              </p>
            )}
          </div>
        )}

        <h3>Характеристики по уровням</h3>
        <table className={styles.levelTable}>
          <thead>
            <tr>
              <th>Уровень</th>
              <th>Здоровье</th>
              <th>Атака</th>
              <th>Навык</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((lvl) => (
              <tr
                key={lvl.level}
                className={
                  lvl.level === piece.currentLevel ? styles.currentRow : ""
                }
              >
                <td>{lvl.level}</td>
                <td>{lvl.health}</td>
                <td>{lvl.attack}</td>
                <td>{lvl.unlock_skill || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {nextStats?.upgrade_cost && (
          <div className={styles.upgradeCost}>
            <h4>Необходимые материалы:</h4>
            <ul>
              {Object.entries(nextStats.upgrade_cost).map(([name, amount]) => (
                <li key={name}>
                  {name}: {String(amount)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextStats ? (
          <button 
            className={styles.upgradeButton} 
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <span className={styles.sparkle}>✨</span>
                Прокачка...
                <span className={styles.sparkle}>✨</span>
              </>
            ) : (
              `🔼 Прокачать до уровня ${nextStats.level}`
            )}
          </button>
        ) : (
          <div className={styles.maxLevelContainer}>
            <p className={styles.maxLevelNote}>Достигнут максимальный уровень</p>
            <div className={styles.maxLevelSparkles}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.maxLevelSparkle} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PieceModal;