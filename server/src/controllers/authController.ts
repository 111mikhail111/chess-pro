import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import bcrypt from 'bcryptjs';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Все поля обязательны' });
      return;
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Транзакция
    await query('BEGIN');

    // 1. Создаем пользователя
    const userResult = await query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING user_id, username, email`,
      [username, email, passwordHash]
    );
    console.log("Создали пользователя")

    const userId = userResult.rows[0].user_id;

    console.log(userId)
    // 2. Добавляем стандартные фигуры
    await query(
      `INSERT INTO user_pieces (user_id, piece_id) 
       SELECT $1, piece_id FROM pieces WHERE type IN ('king', 'pawn')`,
      [userId]
    );

    await query('COMMIT');

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        username,
        email
      }
    });

  } catch (error: any) {
    await query('ROLLBACK');
    
    if (error.code === '23505') {
      res.status(400).json({ error: 'Пользователь с таким email или именем уже существует' });
      return;
    }
    
    console.error('Ошибка регистрации:', error);
    next(error); // Передаем ошибку в централизованный обработчик
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      res.status(400).json({ error: 'Email и пароль обязательны' });
      return;
    }

    // 1. Находим пользователя по email
    const userResult = await query(
      `SELECT user_id, username, email, password_hash, avatar_url, experience, level 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Неверные учетные данные' });
      return;
    }

    const user = userResult.rows[0];

    // 2. Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Неверные учетные данные' });
      return;
    }

    // 3. Генерируем JWT токен
    

    // 4. Возвращаем данные пользователя без пароля и токен
    res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        experience: user.experience,
        level: user.level
      }
    });

  } catch (error) {
    console.error('Ошибка авторизации:', error);
    next(error);
  }
};