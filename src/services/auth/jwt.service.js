import jwt from "jsonwebtoken";
import { BadRequestError } from "../../utils/api-errors.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const env = require("../../../env_config.json");

const generateJWT = async ({
  payload,
  secretKey = env.JWT_ACCESS_TOKEN_SECRET,
  signOption = env.JWT_ACCESS_SIGN_OPTIONS,
}) => {
  try {
    const token = await `Bearer ${jwt.sign(payload, secretKey, signOption)}`;
    return token;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const verifyJWT = async ({
  token,
  secretKey = env.JWT_ACCESS_TOKEN_SECRET,
  signOption = env.JWT_ACCESS_SIGN_OPTIONS,
}) => {
  try {
    const data = await jwt.verify(token, secretKey, signOption);
    return data;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const verifyRefreshJWT = async ({
  token,
  secretKey = env.JWT_REFRESH_TOKEN_SECRET,
}) => {
  try {
    return await jwt.verify(token, secretKey, async (err, payload) => {
      if (err) throw new BadRequestError(err.message);
      return await payload;
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
export { generateJWT, verifyJWT, verifyRefreshJWT };
