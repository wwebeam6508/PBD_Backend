import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import {
  checkIsAganistItSelf,
  checkIsGodAdmin,
  conditionEmptyฺBody,
  encryptPassword,
} from "../../utils/helper.util.js";
import mongoDB from "../../configs/mongo.config.js";

const getUserData = async ({
  page = 1,
  pageSize = 2,
  sortTitle,
  sortType,
  search,
  searchPipeline,
}) => {
  try {
    const db = await mongoDB();
    const ref = db.collection("users");
    let pipeline = [];
    if (sortTitle && sortType) {
      pipeline.push({ $sort: { [sortTitle]: sortType === "desc" ? -1 : 1 } });
    }
    pipeline.push({ $skip: (page - 1) * pageSize });
    pipeline.push({ $limit: pageSize });
    pipeline.push({
      $addFields: {
        userTypeID: { $toObjectId: "$userTypeID.$id" },
      },
    });
    if (search) {
      pipeline = [...searchPipeline, ...pipeline];
    }
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
        userID: "$_id",
        userType: "$userType.name",
        password: 0,
        refreshToken: 0,
      },
    });

    const response = await ref.aggregate(pipeline).toArray();

    return response;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getUserByIDData = async (key) => {
  try {
    const db = admin.firestore();
    const response = await db.doc(`users/${key}`).get();
    let data = response.data();
    data.key = response.id;
    delete data.refreshToken;
    delete data.password;

    return data;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getUserTypeByIDData = async (id) => {
  try {
    const db = admin.firestore();
    const response = await db.doc(`userType/${id}`).get();
    return response.data();
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getUserTypeData = async () => {
  try {
    const db = admin.firestore();
    const response = await db.collection("userType").get();
    let data = response.docs.map((doc) => {
      let newdata = doc.data();
      newdata.key = doc.id;
      return {
        ...newdata,
        key: doc.id,
      };
    });
    return data;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addUserData = async (body) => {
  return new Promise((resolve) => {
    try {
      let data = conditionEmptyฺBody(body);
      const db = admin.firestore();
      data.password = encryptPassword(data.password);
      data.createdAt = admin.firestore.FieldValue.serverTimestamp();
      db.collection(`users`)
        .add(data)
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
      resolve(data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });
};

const updateUserData = async (body, id) => {
  return new Promise((resolve) => {
    try {
      let data = conditionEmptyฺBody(body);
      const db = admin.firestore();
      if (data.password) {
        data.password = encryptPassword(data.password);
      }
      db.doc(`users/${id}`)
        .update(data)
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
      resolve(data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });
};

const deleteUserData = async (id, itSelftID) => {
  return new Promise((resolve) => {
    try {
      if (checkIsAganistItSelf(itSelftID, id)) {
        throw new BadRequestError("Can't delete yourself");
      }
      if (checkIsGodAdmin(id)) {
        throw new BadRequestError("Can't delete God admin");
      }
      const db = admin.firestore();
      db.doc(`users/${id}`)
        .delete()
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
      resolve();
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });
};

const getAllUserCount = async (search, searchPipeline) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("users");
    let pipeline = [];
    if (search) {
      pipeline = [...searchPipeline, ...pipeline];
    }
    pipeline.push({ $count: "total" });
    const total = await snapshot.aggregate(pipeline).next();
    const totalData = total ? total.total : 0;
    return totalData;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  getAllUserCount,
  getUserData,
  getUserByIDData,
  getUserTypeData,
  getUserTypeByIDData,
  addUserData,
  updateUserData,
  deleteUserData,
};
