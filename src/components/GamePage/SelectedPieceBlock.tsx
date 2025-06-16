import React from "react";
import styles from "./SelectedPieceBlock.module.css";

interface PieceStats {
  level: number;
  health: number;
  attack: number;
}

interface Movement {
  type: string;
  range: number;
}

interface Attack {
  type: string;
  range: number;
  damage: number;
}

interface Skill {
  name: string;
  description: string;
  cooldown: number;
}

interface SelectedPieceBlockProps {
  piece?: {
    name: string;
    stats: PieceStats;
    movement: Movement | null;
    attack: Attack | null;
    skills: Skill[] | null;
  };
}

function SelectedPieceBlock({ piece }: SelectedPieceBlockProps) {
  if (!piece) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          Выберите фигуру для просмотра информации
        </div>
      </div>
    );
  }

  // Функция для преобразования названия фигуры
  const getPieceName = (name: string) => {
    const names: Record<string, string> = {
      archer: "Лучник",
      king: "Король",
      pawn: "Пешка",
      knight: "Рыцарь",
      mage: "Маг",
      cannon: "Пушка"
    };
    return names[name] || name;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{getPieceName(piece.name)}</h2>
      
      <div className={styles.imageContainer}>
        <div className={styles.pieceImagePlaceholder}>
          {piece.name.toUpperCase()}
        </div>
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Характеристики</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Уровень</span>
            <span className={styles.statValue}>{piece.stats.level}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Здоровье</span>
            <span className={styles.statValue}>{piece.stats.health}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Атака</span>
            <span className={styles.statValue}>{piece.stats.attack}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Передвижение</h3>
        {piece.movement ? (
          <div className={styles.movementAttack}>
            <span>Тип: {piece.movement.type}</span>
            <span>Дистанция: {piece.movement.range}</span>
          </div>
        ) : (
          <div className={styles.notAvailable}>Информация недоступна</div>
        )}
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Атака</h3>
        {piece.attack ? (
          <div className={styles.movementAttack}>
            <span>Тип: {piece.attack.type}</span>
            <span>Дистанция: {piece.attack.range}</span>
            <span>Урон: {piece.attack.damage}</span>
          </div>
        ) : (
          <div className={styles.notAvailable}>Информация недоступна</div>
        )}
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Навыки</h3>
        {piece.skills && piece.skills.length > 0 ? (
          <div className={styles.skillsList}>
            {piece.skills.map((skill, index) => (
              <div key={index} className={styles.skillItem}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillName}>{skill.name}</span>
                  {skill.cooldown > 0 && (
                    <span className={styles.skillCooldown}>CD: {skill.cooldown}</span>
                  )}
                </div>
                {skill.description && (
                  <p className={styles.skillDescription}>{skill.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.notAvailable}>Навыки отсутствуют</div>
        )}
      </div>
    </div>
  );
}

export default SelectedPieceBlock;