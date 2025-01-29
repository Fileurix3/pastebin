import { CustomError } from "../../utils/utils";
import { UserModel } from "../../models/user_model";
import { Response } from "express";
import { Op } from "@sequelize/core";
import validator from "email-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthServices {
  public async register(name: string, password: string, email: string, res: Response) {
    if (!name) {
      throw new CustomError("Name is required", 400);
    } else if (!password) {
      throw new CustomError("Password is required", 400);
    } else if (!email) {
      throw new CustomError("Email is required", 400);
    } else if (password.length < 6) {
      throw new CustomError("Password must not be less than 6 characters", 400);
    } else if (name.length > 20) {
      throw new CustomError("Name length should not exceed 20 characters", 400);
    }

    if (!validator.validate(email)) {
      throw new CustomError("Invalid email", 400);
    }

    const existingUser: UserModel[] = await UserModel.findAll({
      where: {
        [Op.or]: [{ name: name }, { email: email }],
      },
    });

    if (existingUser.length > 0) {
      throw new CustomError("User with this name or email already exists", 400);
    }

    const hashPassword: string = await bcrypt.hash(password, 10);

    const newUser: UserModel = await UserModel.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "10h",
      },
    );

    res.cookie("token", token, {
      maxAge: 10 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    });

    return {
      message: "User has been successfully registered",
    };
  }

  public async login(email: string, password: string, res: Response) {
    if (!password) {
      throw new CustomError("Password is required", 400);
    } else if (!email) {
      throw new CustomError("Email is required", 400);
    } else if (password.length < 6) {
      throw new CustomError("Password must not be less than 6 characters", 400);
    }

    const user: UserModel | null = await UserModel.findOne({
      where: {
        email: email,
      },
    });

    if (user == null) {
      throw new CustomError("Invalid email or password", 400);
    }

    const hashPassword: boolean = await bcrypt.compare(password, user.password);

    if (!hashPassword) {
      throw new CustomError("Invalid email or password", 400);
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "175h",
      },
    );

    res.cookie("token", token, {
      maxAge: 7 * 25 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    });

    return {
      message: "Login has been successfully",
    };
  }

  public async logout(res: Response) {
    res.clearCookie("token");
    res.clearCookie("registered");
    return {
      message: "logout successfully",
    };
  }
}
