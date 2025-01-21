import { Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handlerError(err: unknown, res: Response): Response {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    console.error(err);
    return res.status(500).json({
      message: (err as Error).message || "Unknown error",
    });
  }
}

export function decodeJwt(token: string): Record<string, string> {
  jwt.verify(token, process.env.JWT_SECRET as string, (err: unknown) => {
    if (err) {
      throw new CustomError("Invalid token", 403);
    }
  });

  const decodeToken = jwt.decode(token);
  return decodeToken as Record<string, string>;
}
