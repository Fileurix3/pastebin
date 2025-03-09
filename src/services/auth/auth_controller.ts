import { Router, NextFunction, Request, Response } from "express";
import { AuthServices } from "./auth_services";

export class AuthController {
  private authServices: AuthServices = new AuthServices();
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/register", this.register.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.post("/logout", this.logout.bind(this));
  }

  private async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password, email } = req.body;

      const message = await this.authServices.register(name, password, email, res);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }

  private async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const message = await this.authServices.login(email, password, res);
      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  }

  private async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await this.authServices.logout(res);
      res.status(200).json(message);
    } catch (err) {
      next(err);
    }
  }
}
