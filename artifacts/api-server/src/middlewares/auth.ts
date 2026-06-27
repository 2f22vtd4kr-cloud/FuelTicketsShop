import { Request, Response, NextFunction } from "express";
import { validateTelegramInitData, TelegramUser } from "../lib/telegram-auth";

declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
      telegramId?: number;
    }
  }
}

const IS_DEV = process.env.NODE_ENV !== "production";

const DEV_MOCK_USER: TelegramUser = {
  id: 12345,
  first_name: "Иван",
  last_name: "Иванов",
  username: "ivanov",
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.headers["x-telegram-initdata"] as string | undefined;

  if (!initData || initData.trim() === "") {
    if (IS_DEV) {
      req.telegramUser = DEV_MOCK_USER;
      req.telegramId = DEV_MOCK_USER.id;
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: missing Telegram auth" });
  }

  try {
    const validated = validateTelegramInitData(initData);
    req.telegramUser = validated.user;
    req.telegramId = validated.user.id;
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid auth";
    return res.status(401).json({ error: `Unauthorized: ${message}` });
  }
}
