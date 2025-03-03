import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/utils";
import jwt from "jsonwebtoken";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies.token;

  try {
    if (!token) {
      throw new CustomError("Unauthorized", 401);
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: unknown) => {
      if (err) {
        throw new CustomError("Invalid token", 403);
      }

      next();
    });
  } catch (err: unknown) {
    next(err);
  }
}
