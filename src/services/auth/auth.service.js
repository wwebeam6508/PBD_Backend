import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/api-errors.js";
import { generateJWT, verifyRefreshJWT } from "./jwt.service.js";
import bcrypt from "bcrypt";
import { createRequire } from "module";
import mongoDB from "../../configs/mongo.config.js";
import { ObjectId } from "mongodb";
import { encryptPassword } from "../../utils/helper.util.js";
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
const env = dotenv.config().parsed;
const loginDB = async ({ username, password }) => {
  const db = await mongoDB();
  const ref = db.collection("users");
  //find by mongoDB not firestore by aggregate
  let pipeline = [];
  pipeline.push({ $match: { username: username, status: { $eq: 1 } } });
  pipeline.push({
    $addFields: {
      userTypeID: { $toObjectId: "$userTypeID.$id" },
    },
  });
  pipeline.push({
    $lookup: {
      from: "userType",
      localField: "userTypeID",
      foreignField: "_id",
      as: "userType",
    },
  });
  pipeline.push({ $unwind: "$userType" });
  pipeline.push({
    $project: {
      _id: 0,
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
    signOption: {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_REFRESH_TOKEN_EXPIRE,
    },
  });
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    userProfile: res,
  };
};

const updateRefreshToken = async ({ token, userID }) => {
  try {
    const db = await mongoDB();
    const ref = db.collection("users");
    const res = await ref.updateOne(
      { _id: userID },
      {
        $set: {
          refreshToken: token,
        },
      }
    );
    return res;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const checkRefreshToken = async ({ token, userID }) => {
  const db = await mongoDB();
  const ref = db.collection("users");
  let pipeline = [];
  pipeline.push({ $match: { _id: new ObjectId(userID), status: { $eq: 1 } } });
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
    if (
      !(await checkRefreshToken({ token: token, userID: data.data.userID }))
    ) {
      throw new ForbiddenError("Token ไม่ถูกต้อง");
    }
    const accessToken = await generateJWT({
      payload: { data: data.data },
    });
    return {
      accessToken: accessToken,
      userID: data.data.userID,
    };
  } catch (error) {
    throw new BadRequestError("Access Denied");
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

const fetchUserData = async ({ userID }) => {
  try {
    const db = await mongoDB();
    const ref = db.collection("users");
    let pipeline = [];
    pipeline.push({
      $match: { _id: new ObjectId(userID), status: { $eq: 1 } },
    });
    pipeline.push({
      $addFields: {
        userTypeID: { $toObjectId: "$userTypeID.$id" },
      },
    });
    pipeline.push({
      $lookup: {
        from: "userType",
        localField: "userTypeID",
        foreignField: "_id",
        as: "userType",
      },
    });
    pipeline.push({ $unwind: "$userType" });
    pipeline.push({
      $project: {
        _id: 0,
        userID: "$_id",
        username: 1,
        userType: {
          userTypeID: "$userType._id",
          name: "$userType.name",
          permission: "$userType.permission",
        },
      },
    });
    const res = await ref.aggregate(pipeline).next();
    if (!res) {
      throw new NotFoundError("ไม่พบผู้ใช้");
    }
    return res;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const changePasswordData = async ({ data, userID }) => {
  if (data.password !== data.confirmPassword) {
    throw new BadRequestError("รหัสผ่านไม่ตรงกัน");
  }
  try {
    const db = await mongoDB();
    const ref = db.collection("users");
    await ref.updateOne(
      { _id: userID },
      {
        $set: {
          password: (data.password = await encryptPassword(data.password)),
        },
      }
    );
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
export {
  loginDB,
  refreshTokenDB,
  updateRefreshToken,
  removeRefreshToken,
  fetchUserData,
  changePasswordData,
};
