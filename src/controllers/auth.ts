import { Request, Response, NextFunction } from "express";
import IRequest from "request";
import asyncHandler from "../middlewares/asyncHandler";
import User from "../models/User";

const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password }: { email: string; password: string } = req.body;
    if (!email || !password) {
      return next({
        message: "Please provide email and password",
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next({
        message: "The email is not yet registered to an accout",
        statusCode: 400,
      });
    }

    const match = user.checkPassword(password);

    if (!match) {
      return next({ message: "The password does not match", statusCode: 400 });
    }
    const token = user.getJwtToken();

    res.status(200).json({ success: true, token });
  }
);

const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, username, email, password } = req.body;

    const user = await User.create({ name, username, email, password });

    const token = user.getJwtToken();

    res.status(200).json({ success: true, token });
  }
);

const me = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  const { profilePic, username, name, email, _id } = req.user;

  res.status(200).json({
    success: true,
    data: { profilePic, username, name, email, _id },
  });
});

export { login, register, me };
