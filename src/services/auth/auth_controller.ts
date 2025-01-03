import { Request, Response } from "express";
import { handlerError } from "../../index.js";
import { AuthServices } from "./auth_services.js";

export class AuthController {
  private authServices: AuthServices;

  constructor() {
    this.authServices = new AuthServices();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, password, email } = req.body;

      const message = await this.authServices.register(name, password, email, res);
      res.status(201).json(message);
    } catch (err) {
      handlerError(err, res);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const message = await this.authServices.login(email, password, res);
      res.status(200).json(message);
    } catch (err) {
      handlerError(err, res);
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const message = await this.authServices.logout(res);
      res.status(200).json(message);
    } catch (err) {
      handlerError(err, res);
    }
  };
}
