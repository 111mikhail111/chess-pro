import React from "react";
import styles from "./ProfilePage.module.css";
import { AuthModal } from "./ProfilePage/AuthModal";
import { useUser } from "../contexts/UserContext";
import PieceModal from "./ProfilePage/PieceModal";
import Inventory from "./ProfilePage/Inventory";

// Все возможные фигуры в игре

type Piece = {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  isUnlocked: boolean;
  unlockLevel?: number;
  currentLevel?: number;
};

const ProfilePage: React.FC = () => {
  const { user, login, logout } = useUser();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [pieces, setPieces] = React.useState<Piece[]>([]);
  const [selectedPiece, setSelectedPiece] = React.useState<any>(null);
  const [pieceLevels, setPieceLevels] = React.useState([]);

  React.useEffect(() => {
    const fetchPieces = async () => {
      try {
        const response = await fetch(
          `/api/pieces/collection?userId=${user?.userId}`
        );
        const data = await response.json();
        console.log("Загруженные фигуры:", data.pieces);
       
        setPieces(data.pieces);
      } catch (err) {
        console.error("Ошибка загрузки фигур:", err);
      }
    };

    if (user?.userId) {
      fetchPieces();
    }
  }, [user]);

  const handleLoginSuccess = (userData: any) => {
    login({
      userId: userData.id,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
      experience: userData.experience,
      level: userData.level,
      rating: userData.rating,
    });
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

  function getNextLevelXP(level: number): number {
    return (level + 1) * 1000;
  }

  // Пример данных для демонстрации (в реальном приложении это будет из базы данных)
  const playerData = {
    chests: 3,
    unlockedPieces: ["king", "knight", "pawn", "archer", "cannon", "mage"],
  };

  const handlePieceClick = async (piece: any) => {
    if (!piece.isUnlocked) return;

    try {
      const res = await fetch(`/api/pieces/${piece.id}/levels`);
      const data = await res.json();
      setSelectedPiece(piece);
      setPieceLevels(data.levels);
    } catch (err) {
      console.error("Ошибка при получении данных о фигуре:", err);
    }
  };

  

  return (
    <div className={styles.profileContainer}>
      {user ? (
        <>
          <div className={styles.playerInfo}>
            <div className={styles.profileHeader}>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="Аватар"
                  className={styles.avatar}
                />
              )}
              <h1 className={styles.playerName}>{user.username}</h1>
              <button onClick={logout} className={styles.logoutButton}>
                Выйти
              </button>
            </div>

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

          <Inventory/>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Коллекция персонажей</h2>
            <div className={styles.piecesGrid}>
              {pieces.map((piece) => {
                const isUnlocked = piece.isUnlocked;

                return (
                  <div
                    key={piece.id}
                    className={`${styles.pieceCard} ${
                      !piece.isUnlocked ? styles.locked : ""
                    }`}
                    onClick={() => handlePieceClick(piece)}
                  >
                    <div className={styles.pieceImageContainer}>
                      <div className={styles.pieceImage}>
                        {isUnlocked ? (
                          <img
                            src={
                              piece.imageUrl ||
                              `/sprites/${piece.type}_white.png`
                            }
                            alt={piece.name}
                            className={styles.pieceSprite}
                          />
                        ) : (
                          <div className={styles.lockedOverlay}>🔒</div>
                        )}
                      </div>
                    </div>
                    <div className={styles.pieceName}>
                      {piece.name}
                      {piece.isUnlocked && (
                        <span className={styles.pieceLevel}>
                          {" "}
                          — ур. {piece.currentLevel}
                        </span>
                      )}
                    </div>
                    {!isUnlocked && (
                      <div className={styles.unlockHint}>
                        Откроется на {piece.unlockLevel} уровне
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
          Войти / Зарегистрироваться
        </button>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {selectedPiece && (
        <PieceModal
          piece={selectedPiece}
          levels={pieceLevels}
          onClose={() => {
            setSelectedPiece(null);
            setPieceLevels([]);
          }}
          onUpgrade={() => {
            const newLevel = selectedPiece.currentLevel + 1;
            setSelectedPiece((prev : any) => ({
              ...prev,
              currentLevel: newLevel,
            }));
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
