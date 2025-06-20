import { Request, Response, NextFunction } from "express";
import { query } from "../db"; // или откуда у тебя query

export const getUserPiecesCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid or missing userId" });
      return;
    }

    const allPiecesResult = await query(`
      SELECT piece_id, name, type, unlock_level, description, image_url
      FROM pieces
    `);

    const unlockedResult = await query(
      `SELECT piece_id, current_level FROM user_pieces WHERE user_id = $1`,
      [userId]
    );

    const unlockedMap = new Map<number, number>();
    unlockedResult.rows.forEach((row) => {
      unlockedMap.set(row.piece_id, row.current_level);
    });

    const pieces = allPiecesResult.rows.map((piece) => ({
      id: piece.piece_id,
      name: piece.name,
      type: piece.type,
      unlockLevel: piece.unlock_level,
      description: piece.description,
      imageUrl: piece.image_url,
      isUnlocked: unlockedMap.has(piece.piece_id),
      currentLevel: unlockedMap.get(piece.piece_id) || null,
    }));

    res.status(200).json({ success: true, pieces });
  } catch (error) {
    console.error("Ошибка при получении коллекции фигур:", error);
    next(error);
  }
};

export const getPieceLevels = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pieceId = Number(req.params.pieceId);
    if (isNaN(pieceId)) {
      res.status(400).json({ error: "Invalid pieceId" });
      return;
    }

    const result = await query(
      `SELECT level, health, attack, unlock_skill, upgrade_cost
       FROM piece_levels
       WHERE piece_id = $1
       ORDER BY level`,
      [pieceId]
    );

    res.status(200).json({ success: true, levels: result.rows });
  } catch (error) {
    console.error("Ошибка при получении уровней фигуры:", error);
    next(error);
  }
};

export const upgradeUserPiece = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pieceId = Number(req.params.pieceId);
    const userId = Number(req.body.userId);
    if (isNaN(pieceId) || isNaN(userId)) {
      res.status(400).json({ error: "Invalid pieceId or userId" });
      return;
    }

    // 1. Получаем текущий уровень фигуры пользователя
    const currentResult = await query(
      `SELECT current_level FROM user_pieces
       WHERE user_id = $1 AND piece_id = $2`,
      [userId, pieceId]
    );

    if (currentResult.rows.length === 0) {
       res.status(404).json({ error: "Piece not found for user" });
       return;
    }

    const currentLevel = currentResult.rows[0].current_level;
    const nextLevel = currentLevel + 1;

    // 2. Получаем upgrade_cost для следующего уровня
    const levelResult = await query(
      `SELECT upgrade_cost FROM piece_levels
       WHERE piece_id = $1 AND level = $2`,
      [pieceId, nextLevel]
    );

    if (levelResult.rows.length === 0) {
       res.status(400).json({ error: "Max level reached" });
       return;
    }

    const upgradeCost = levelResult.rows[0].upgrade_cost || {};

    // 3. Проверяем, хватает ли предметов
    const inventoryResult = await query(
      `SELECT item_id, quantity FROM user_inventory
       WHERE user_id = $1`,
      [userId]
    );

    const inventoryMap = new Map<number, number>();
    inventoryResult.rows.forEach((row) => {
      inventoryMap.set(row.item_id, row.quantity);
    });

    // Получаем item_id для всех нужных предметов по названиям
    const itemNames = Object.keys(upgradeCost);
    const itemQueryResult = await query(
      `SELECT item_id, name FROM items WHERE name = ANY($1::text[])`,
      [itemNames]
    );

    const nameToId = new Map(
      itemQueryResult.rows.map((r) => [r.name, r.item_id])
    );

    // Проверка доступности всех предметов
    for (const name of itemNames) {
      const itemId = nameToId.get(name);
      const requiredQty = upgradeCost[name];
      const userQty = inventoryMap.get(itemId) || 0;

      if (userQty < requiredQty) {
         res.status(400).json({ error: `Недостаточно: ${name}` });
         return;
      }
    }

    // 4. Всё ок — списываем материалы и апгрейдим

    try {
      for (const name of itemNames) {
        const itemId = nameToId.get(name);
        const requiredQty = upgradeCost[name];

        await query(
          `UPDATE user_inventory
           SET quantity = quantity - $1
           WHERE user_id = $2 AND item_id = $3`,
          [requiredQty, userId, itemId]
        );
      }

      await query(
        `UPDATE user_pieces
         SET current_level = current_level + 1
         WHERE user_id = $1 AND piece_id = $2`,
        [userId, pieceId]
      );

      res.status(200).json({ success: true, newLevel: nextLevel });
    } catch (err) {
      throw err;
    }
  } catch (error) {
    console.error("Ошибка при прокачке фигуры:", error);
    next(error);
  }
};
