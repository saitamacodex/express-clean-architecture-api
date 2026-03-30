import express from "express";
import authRoute from "./modules/auth/auth.route.js";
import cookieParser from "cookie-parser";
import ApiError from "./common/utils/api-error.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);

// Catch all for undefined routes
app.all("{*path}", (req, res) => {
  throw ApiError.notfound(`Route ${req.originalUrl} not found.`);
});

export default app;
