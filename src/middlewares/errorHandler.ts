import { Request, Response, NextFunction } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let message = err.message || "Internal server error";
  let statusCode = err.statudsCode || 500;
  console.log(err);

  if (err.code === 11000) {
    message = "Duplicate key";

    if (err.keyValue.email) {
      message = "The email is already taken";
    }

    if (err.keyValue.username) {
      message = "The username is already taken";
    }

    statusCode = 400;
  }

  if (err.name === "CastError") {
    message = "The ObjectID is malformed";
    statusCode = 400;
  }
  res.status(statusCode).json({ sucess: false, message });
};

export default errorHandler;
