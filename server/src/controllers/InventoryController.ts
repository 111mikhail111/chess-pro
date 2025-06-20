import { Request, Response, NextFunction } from "express";
import { query } from "../db";

export const getUserInventory = async (
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

    const result = await query(
      `SELECT i.item_id, i.name, i.description, i.image_url, i.rarity, ui.quantity
       FROM user_inventory ui
       JOIN items i ON ui.item_id = i.item_id
       WHERE ui.user_id = $1`,
      [userId]
    );

    res.status(200).json({ success: true, items: result.rows });
  } catch (error) {
    console.error("Ошибка при получении инвентаря:", error);
    next(error);
  }
};
