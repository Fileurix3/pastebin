import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/utils";

export function errorMiddleware(
  err: CustomError | unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 500,
      message: (err as Error).message || "Internal Server Error",
    });
  }
}
