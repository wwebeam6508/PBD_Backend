import jwt from "jsonwebtoken";
import { BadRequestError } from "../../utils/api-errors.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
const env = dotenv.config().parsed;
const generateJWT = async ({
  payload,
  secretKey = env.JWT_ACCESS_TOKEN_SECRET,
  signOption = {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE,
  },
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
  signOption = {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE,
  },
}) => {
  try {
    return await jwt.verify(token, secretKey, signOption);
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const verifyRefreshJWT = async ({
  token,
  secretKey = env.JWT_REFRESH_TOKEN_SECRET,
  signOption = {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRE,
  },
}) => {
  try {
    return await jwt.verify(
      token,
      secretKey,
      signOption,
      async (err, payload) => {
        if (err) throw new BadRequestError(err.message);
        return await payload;
      }
    );
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
export { generateJWT, verifyJWT, verifyRefreshJWT };
