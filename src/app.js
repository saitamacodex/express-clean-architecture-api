import express from "express";
import authRoute from "./modules/auth/auth.route.js";
const app = express();

app.use("/auth", authRoute);

export default app;
