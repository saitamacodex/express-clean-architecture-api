import express from "express";
import authRoute from "./modules/auth/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoute);

export default app;
