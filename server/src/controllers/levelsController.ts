import { Request, Response, NextFunction } from "express";
import { query } from "../db";

// Расширяем интерфейс Request для поддержки user
declare global {
  namespace Express {
    interface User {
      userId: number;
      // добавьте другие свойства пользователя, если нужно
    }
    interface Request {
      user?: User;
    }
  }
}

export const getLevels = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allLevelsResult = await query(
      `SELECT level_id, name, difficulty, board_config, 
              reward_experience
       FROM levels
       ORDER BY difficulty`
    );

    const allLevels = allLevelsResult.rows;
    const userId = req.body.userId;

    let availableLevelIds: number[] = [];

    if (userId) {
      // Получаем список пройденных уровней
      const passedResult = await query(
        `SELECT level_id FROM user_level_progress
         WHERE user_id = $1`,
        [userId]
      );

      const passedLevels = passedResult.rows.map((r) => r.level_id);
      
      // Получаем максимум по сложности среди пройденных уровней
      const passedDifficulties = allLevels
        .filter((level) => passedLevels.includes(level.level_id))
        .map((level) => level.difficulty);

      const maxPassedDifficulty =
        passedDifficulties.length > 0 ? Math.max(...passedDifficulties) : 0;

      // Открыты: все пройденные уровни + уровень со следующей сложностью
      availableLevelIds = allLevels
        .filter(
          (level) =>
            passedLevels.includes(level.level_id) ||
            level.difficulty === maxPassedDifficulty + 1
        )
        .map((level) => level.level_id);
    } else {
      // Если юзер не авторизован — доступен только самый первый уровень
      const minDifficulty = Math.min(...allLevels.map((lvl) => lvl.difficulty));
      availableLevelIds = allLevels
        .filter((lvl) => lvl.difficulty === minDifficulty)
        .map((lvl) => lvl.level_id);
    }

    // Формируем итоговый ответ
    const levels = allLevels.map((level) => ({
      id: level.level_id,
      name: level.name,
      difficulty: level.difficulty,
      boardConfig: level.board_config,
      reward: {
        experience: level.reward_experience,
        pieces: level.reward_pieces,
      },
      isAvailable: availableLevelIds.includes(level.level_id),
    }));

    res.status(200).json({
      success: true,
      levels,
    });
  } catch (error) {
    console.error("Ошибка получения уровней:", error);
    next(error);
  }
};

export const getLevelById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.body;
    const levelId = id;
    console.log("Получили id уровня", req.params.id);
    if (isNaN(levelId)) {
      res.status(400).json({ error: "Некорректный ID уровня" });
      return;
    }

    // Проверяем доступность уровня для пользователя
    const userId = req.user?.userId;
    if (userId && levelId > 1) {
      const accessResult = await query(
        `SELECT 1 FROM user_level_progress
         WHERE user_id = $1 AND level_id = $2 AND completed = true`,
        [userId, levelId - 1]
      );

      if (accessResult.rows.length === 0) {
        res.status(403).json({ error: "Уровень еще не доступен" });
        return;
      }
    }

    // Получаем данные уровня
    const levelResult = await query(
      `SELECT level_id, name, difficulty, board_config, 
              reward_experience
       FROM levels
       WHERE level_id = $1`,
      [levelId]
    );

    if (levelResult.rows.length === 0) {
      res.status(404).json({ error: "Уровень не найден" });
      return;
    }

    const level = levelResult.rows[0];

    res.status(200).json({
      success: true,
      level: {
        id: level.level_id,
        name: level.name,
        difficulty: level.difficulty,
        boardConfig: level.board_config,
        reward: {
          experience: level.reward_experience,
          pieces: level.reward_pieces,
        },
      },
    });
  } catch (error) {
    console.error("Ошибка получения уровня:", error);
    next(error);
  }
};

export const completeLevel = async (req: Request, res: Response) => {
  try {
    const { userId, levelId } = req.body;

    // Проверяем существует ли уровень
    const levelExists = await query(
      "SELECT level_id FROM levels WHERE level_id = $1",
      [levelId]
    );

    if (levelExists.rows.length === 0) {
      return res.status(404).json({ message: "Level not found" });
    }

    // Добавляем запись о прохождении уровня (если ее еще нет)
    const result = await query(
      `INSERT INTO user_level_progress (user_id, level_id) 
       VALUES ($1, $2)
       ON CONFLICT (user_id, level_id) DO NOTHING
       RETURNING *`,
      [userId, levelId]
    );

    // Если запись была добавлена (а не пропущена из-за конфликта)
    if (result.rows.length > 0) {
      return res.status(200).json({
        message: "Level marked as completed",
        completedLevel: result.rows[0],
      });
    }

    // Если уровень уже был пройден
    return res.status(200).json({
      message: "Level was already completed",
    });
  } catch (error) {
    console.error("Error completing level:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCompletedLevels = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT l.id, l.name, l.difficulty, p.completed_at
       FROM levels l
       JOIN user_level_progress p ON l.id = p.level_id
       WHERE p.user_id = $1
       ORDER BY p.completed_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching completed levels:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLevelRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    const levelId = parseInt(req.params.levelId);
    const userId = parseInt(req.params.userId);

    if (isNaN(levelId) || isNaN(userId)) {
       res.status(400).json({ message: "Invalid levelId or userId" });
       return;
    }

    // 1. Получаем список возможных наград
    const result = await query(
      `SELECT 
        r.item_id,
        i.name,
        i.image_url,
        i.rarity,
        r.chance,
        r.min_amount,
        r.max_amount
      FROM level_rewards r
      JOIN items i ON i.item_id = r.item_id
      WHERE r.level_id = $1`,
      [levelId]
    );

    const rawRewards = result.rows;

    // 2. Симулируем выпадение наград
    const finalRewards = rawRewards
      .filter(r => Math.random() <= r.chance)
      .map(r => ({
        item_id: r.item_id,
        name: r.name,
        image_url: r.image_url,
        rarity: r.rarity,
        amount:
          Math.floor(Math.random() * (r.max_amount - r.min_amount + 1)) +
          r.min_amount,
      }));

    // 3. Обновляем инвентарь игрока
    for (const reward of finalRewards) {
      await query(
        `INSERT INTO user_inventory (user_id, item_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET quantity = user_inventory.quantity + EXCLUDED.quantity`,
        [userId, reward.item_id, reward.amount]
      );
    }

    res.status(200).json(finalRewards);
  } catch (error) {
    console.error("Error applying rewards:", error);
    res.status(500).json({ message: "Server error" });
  }
};
