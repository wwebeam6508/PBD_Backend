import jwt from "jsonwebtoken";
import { createRequire } from "module";
import { AccessDeniedError, UnauthorizedError } from "../utils/api-errors.js";
import mongoDB from "../configs/mongo.config.js";
import { ObjectId } from "mongodb";
const require = createRequire(import.meta.url);
const env = require("../../env_config.json");

export default (permission_group, permission_name) =>
  async (req, res, next) => {
    try {
      const token = req.header("Authorization").split(" ")[1];
      const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_TOKEN_SECRET,
        env.JWT_ACCESS_SIGN_OPTIONS
      );
      req.user = decoded;
      const userID = req.user.data._id;

      const user = await getUserByID(userID);
      if (!user) {
        throw {
          status: 401,
          message: "ไม่พบผู้ใช้",
        };
      }
      const userTypeID = req.user.data.userType.userTypeID;
      if (user.userType.userTypeID.toString() !== userTypeID) {
        throw {
          status: 401,
          message: "มีการดัดแปลง token ไม่ถูกต้อง",
        };
      }

      const permissions = user.userType.permission;
      if (permissions[permission_group][permission_name]) {
        next();
      } else {
        throw {
          status: 403,
          message: "ไม่มีสิทธิ์ในการเข้าถึง",
        };
      }
    } catch (error) {
      return res.status(error.status).send({
        error: {
          message: error.message,
          code: error.status,
        },
      });
    }
  };

async function getUserByID(userID) {
  const db = await mongoDB();
  let pipeline = [];
  pipeline.push({
    $match: {
      _id: new ObjectId(userID),
    },
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
  pipeline.push({
    $unwind: "$userType",
  });
  pipeline.push({
    $project: {
      userType: {
        userTypeID: "$userType._id",
        name: "$userType.name",
        permission: "$userType.permission",
      },
    },
  });
  const ref = db.collection("users");
  return await ref.aggregate(pipeline).next();
}
