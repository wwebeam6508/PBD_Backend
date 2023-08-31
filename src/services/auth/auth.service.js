import {
  AccessDeniedError,
  BadRequestError,
  NotFoundError,
} from "../../utils/api-errors.js";
import { generateJWT, verifyRefreshJWT } from "./jwt.service.js";
import bcrypt from "bcrypt";
import { createRequire } from "module";
import mongoDB from "../../configs/mongo.config.js";
const require = createRequire(import.meta.url);
const env = require("../../../env_config.json");
const loginDB = async ({ username, password }) => {
  const db = await mongoDB();
  const ref = db.collection("users");
  //find by mongoDB not firestore by aggregate
  let pipeline = [];
  pipeline.push({ $match: { username: username } });
  pipeline.push({
    $lookup: {
      from: "userType",
      localField: "userTypeID.$id",
      foreignField: "_id",
      as: "userType",
    },
  });
  pipeline.push({ $unwind: "$userType" });
  pipeline.push({
    $project: {
      userID: "$_id",
      username: 1,
      password: 1,
      userType: {
        userTypeID: "$userType._id",
        name: "$userType.name",
        permission: "$userType.permission",
      },
      refreshToken: 1,
    },
  });
  const res = await ref.aggregate(pipeline).next();

  if (!res) {
    throw new NotFoundError("ไม่พบผู้ใช้");
  }

  const isValidPass = bcrypt.compareSync(password, res.password);

  if (!isValidPass) {
    throw new BadRequestError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  delete res.password;
  delete res.refreshToken;
  const accessToken = await generateJWT({ payload: { data: res } });
  const refreshToken = await generateJWT({
    payload: { data: res },
    secretKey: env.JWT_REFRESH_TOKEN_SECRET,
    signOption: env.JWT_REFRESH_SIGN_OPTIONS,
  });
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    userProfile: res,
  };
};

const updateRefreshToken = async ({ token, userID }) => {
  const db = await mongoDB();
  const ref = db.collection("users");
  const res = await ref
    .updateOne(
      { _id: userID },
      {
        $set: {
          refreshToken: token,
        },
      }
    )
    .catch((err) => {
      throw new BadRequestError(err.message);
    });
  return res;
};

const checkRefreshToken = async ({ token, userID }) => {
  const db = await mongoDB();
  const ref = db.collection("users");
  let pipeline = [];
  pipeline.push({ $match: { _id: userID } });
  pipeline.push({
    $project: {
      refreshToken: 1,
    },
  });
  const result = await ref.aggregate(pipeline).next();
  if (result.refreshToken.split(" ")[1] != token) return false;
  return true;
};

const refreshTokenDB = async ({ token }) => {
  try {
    const data = await verifyRefreshJWT({ token: token });
    if (!(await checkRefreshToken({ token: token, userID: data.data.userID })))
      throw new AccessDeniedError("Access Denied");
    const refreshToken = await generateJWT({
      payload: { data: data.data },
      secretKey: env.JWT_REFRESH_TOKEN_SECRET,
      signOption: env.JWT_REFRESH_SIGN_OPTIONS,
    });
    const accessToken = await generateJWT({ payload: data.data });
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
      userID: data.data.userID,
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const removeRefreshToken = async ({ userID }) => {
  const db = await mongoDB();
  const ref = db.collection("users");
  await ref
    .updateOne(
      { _id: userID },
      {
        $set: {
          refreshToken: "",
        },
      }
    )
    .catch((err) => {
      throw new BadRequestError(err.message);
    });
};

export { loginDB, refreshTokenDB, updateRefreshToken, removeRefreshToken };
