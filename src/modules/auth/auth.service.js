import ApiError from "../../common/utils/api-error.js";
import User from "../../models/user.model.js";
import { generateResetToken } from "../../common/utils/jwt.token.js";

const register = async ({ name, email, password, role }) => {
  const existing = await User.findone({ email });

  if (existing) {
    throw ApiError.conflict("Email already exist");
  }

  const { rawToken, hashedToken } = generateResetToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

export { register };
