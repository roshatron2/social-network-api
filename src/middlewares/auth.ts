import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import IUser from "../types/user";
import IRequest from "../types/request";

const protect = async (req: any, res: Response, next: NextFunction) => {
  let token: string = "";
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next({
      message: "You need to be logged in to visit this route",
      statusCode: 403,
    });
  }

  try {
    const decoded: any = jwt.verify(token, "secret" || process.env.JWT_SECRET);

    const user: Omit<IUser, "password"> | null = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return next({ message: `No user found for ID ${decoded.id}` });
    }
    req.user = user;
    next();
  } catch (err) {
    next({
      message: "You need to be logged in to visit this route",
      statusCode: 403,
    });
  }
};

export { protect };
