import express from "express";
import authRoute from "./modules/auth/auth.route.js";
import cookieParser from "cookie-parser";
import ApiError from "./common/utils/api-error.js";

// create express app
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoute);

// Catch all for undefined routes
app.all("{*path}", (req, res) => {
  throw ApiError.notfound(`Route ${req.originalUrl} not found.`);
});

export default app;
