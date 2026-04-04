import ApiError from "../../common/utils/api-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.token.js";
import User from "./auth.model.js";

// to check if the user logged in or not
// so every time user hit a endpoint we need to verify whether the user is logged it or not
// so user will send the token in the header
// fetch the token from header
const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) throw ApiError.unauthorized("Not Authenticated");
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user) throw ApiError.unauthorized("User no longer logged in");
  req.user = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  next();
};

const authorizeCheck = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw ApiError.forbidden(
        "You do not have permission to perform this action",
      );
    }
    next();
  };
};

export { authenticate, authorizeCheck };
