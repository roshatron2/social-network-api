import express, { Application } from "express";
import errorHandler from "./middlewares/errorHandler";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });
import connectToDb from "./utils/db";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import commentRoutes from "./routes/comment";

const app: Application = express();
const PORT: string | number = process.env.PORT || 5000;

connectToDb();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.send("Index route ");
});
app.use("/auth", authRoutes);
app.use("/p", postRoutes);
app.use("/u", userRoutes);
app.use("/c", commentRoutes);
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server started in Port ${PORT}`));
