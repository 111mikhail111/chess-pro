import React, { useState } from "react";
import styles from "./ProfilePage.module.css";
import { AuthModal } from "./ProfilePage/AuthModal";

interface User {
  userId: number;
  username: string;
  email: string;
  avatarUrl?: string;
  experience: number;
  level: number;
  rating?: number;
}

const ProfilePage: React.FC = () => {
  // Пример данных игрока
  const playerData = {
    name: "Шахматный Мастер",
    level: 24,
    experience: 65, // в процентах
    unlockedPieces: ["king", "knight", "pawn", "archer", "cannon", "mage"],
    lockedPieces: ["dragon", "ninja", "wizard", "queen", "rook", "bishop"],
    chests: 3,
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User>();

  const handleLoginSuccess = (userData: any) => {
    console.log(userData);
    setUser(userData);
    setShowAuthModal(false);
  };

  function calculateExperiencePercentage(exp: number, level: number): number {
    const baseXP = level * 1000;
    const nextLevelXP = (level + 1) * 1000;
    return Math.min(
      100,
      Math.round(((exp - baseXP) / (nextLevelXP - baseXP)) * 100)
    );
  }

  // Получаем XP для следующего уровня
  function getNextLevelXP(level: number): number {
    return (level + 1) * 1000;
  }

  // Все возможные фигуры в игре
  const allPieces = [
    { id: "king", name: "Король" },
    { id: "knight", name: "Конь" },
    { id: "pawn", name: "Пешка" },
    { id: "archer", name: "Лучник" },
    { id: "cannon", name: "Пушка" },
    { id: "mage", name: "Маг" },
    { id: "queen", name: "Ферзь" },
    { id: "rook", name: "Ладья" },
    { id: "bishop", name: "Слон" },
    { id: "dragon", name: "Дракон" },
    { id: "ninja", name: "Ниндзя" },
    { id: "wizard", name: "Волшебник" },
  ];

  return (
    <div className={styles.profileContainer}>
      {/* Блок информации об игроке */}
      {user ? (
        <>
          <div className={styles.playerInfo}>
            {/* Аватар и имя */}
            <div className={styles.profileHeader}>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="Аватар"
                  className={styles.avatar}
                />
              )}
              <h1 className={styles.playerName}>{user.username}</h1>
            </div>

            {/* Уровень и прогресс */}
            <div className={styles.levelContainer}>
              <div className={styles.levelBadge}>Уровень {user.level}</div>
              <div className={styles.expBar}>
                <div
                  className={styles.expProgress}
                  style={{
                    width: `${calculateExperiencePercentage(
                      user.experience,
                      user.level
                    )}%`,
                  }}
                ></div>
                <span className={styles.expText}>
                  {user.experience} XP / {getNextLevelXP(user.level)} XP
                </span>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Рейтинг:</span>
                <span className={styles.statValue}>{user.rating || "Н/Д"}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Email:</span>
                <span className={styles.statValue}>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Блок сундуков */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Сундуки</h2>
            <div className={styles.chestsContainer}>
              {[...Array(playerData.chests)].map((_, i) => (
                <div key={i} className={styles.chest}>
                  <div className={styles.chestIcon}>🎁</div>
                  <button className={styles.openButton}>Открыть</button>
                </div>
              ))}
            </div>
          </div>

          {/* Блок персонажей */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Коллекция персонажей</h2>
            <div className={styles.piecesGrid}>
              {allPieces.map((piece) => {
                const isUnlocked = playerData.unlockedPieces.includes(piece.id);
                return (
                  <div
                    key={piece.id}
                    className={`${styles.pieceCard} ${
                      !isUnlocked ? styles.locked : ""
                    }`}
                  >
                    <div className={styles.pieceImageContainer}>
                      <div className={styles.pieceImage}>
                        {isUnlocked ? (
                          <img
                            src={`/sprites/${piece.id}_white.png`}
                            alt={piece.name}
                            className={styles.pieceSprite}
                          />
                        ) : (
                          <div className={styles.lockedOverlay}>🔒</div>
                        )}
                      </div>
                    </div>
                    <div className={styles.pieceName}>{piece.name}</div>
                    {!isUnlocked && (
                      <div className={styles.unlockHint}>
                        Откроется на 30 уровне
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className={styles.authButton}
        >
          Login / Register
        </button>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;
