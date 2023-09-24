import jwt from "jsonwebtoken";
import { AccessDeniedError } from "../utils/api-errors.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
const env = dotenv.config().parsed;
export default () => (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE,
    });
    req.user = decoded;
    next();
  } catch (error) {
    throw new AccessDeniedError(error.message);
  }
};
