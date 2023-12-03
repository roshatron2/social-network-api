import { Request } from "express";
import IUser from "./user";

export default interface IRequest extends Request {
  user: any;
}
