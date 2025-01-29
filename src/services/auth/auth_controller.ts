import { NextFunction, Request, Response } from "express";
import { AuthServices } from "./auth_services";

export class AuthController {
  private authServices: AuthServices;

  constructor() {
    this.authServices = new AuthServices();
  }

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, password, email } = req.body;

      const message = await this.authServices.register(name, password, email, res);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  };

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      const message = await this.authServices.login(email, password, res);
      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  };

  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const message = await this.authServices.logout(res);
      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  };
}
