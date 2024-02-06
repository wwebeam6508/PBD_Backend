import { BadRequestError } from "../../utils/api-errors.js";
import mongoDB from "../../configs/mongo.config.js";
import { ObjectId } from "mongodb";

export const prePermission = {
  user: {
    canViewUser: false,
    canEditUser: false,
    canRemove: false,
  },
  userType: {
    canViewUserType: false,
    canEditUserType: false,
    canRemoveUserType: false,
  },
  project: {
    canViewProject: false,
    canEditProject: false,
    canRemoveProject: false,
  },
  expense: {
    canViewExpense: false,
    canEditExpense: false,
    canRemoveExpense: false,
  },
};
const getUserTypeData = async ({
  page = 1,
  pageSize = 5,
  sortTitle,
  sortType,
  search,
  searchPipeline,
}) => {
  try {
    const offset = pageSize * (page - 1);
    const db = await mongoDB();
    const snapshot = db.collection("userType");
    let pipeline = [];
    if (sortTitle && sortType) {
      pipeline.push({ $sort: { [sortTitle]: sortType === "desc" ? -1 : 1 } });
    }
    if (search) {
      //merge searchPipeline with pipeline
      pipeline = [...searchPipeline, ...pipeline];
    }

    pipeline.push({
      $match: { status: { $eq: 1 }, name: { $ne: "SuperAdmin" } },
    });

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: pageSize });
    // get only userTypeID and name and address and taxID
    pipeline.push({
      $project: {
        userTypeID: "$_id",
        name: 1,
        date: "$createdAt",
      },
    });
    const total = await snapshot.aggregate(pipeline).toArray();
    return total;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getUserTypeByIDData = async (userTypeID) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("userType");
    let pipeline = [];
    pipeline.push({
      $match: { _id: new ObjectId(userTypeID), status: { $eq: 1 } },
    });
    // get only userTypeID and name and address and taxID
    pipeline.push({
      $project: {
        userTypeID: "$_id",
        name: 1,
        permission: 1,
      },
    });
    const res = await snapshot.aggregate(pipeline).next();
    return res;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addUserTypeData = async ({ name, permission = {} }) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("userType");
    const addPermission = { ...prePermission, ...permission };
    const userTypeQuery = await snapshot.insertOne({
      name,
      permission: addPermission,
      status: 1,
      createdAt: new Date(),
    });
    return userTypeQuery.insertedId;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateUserTypeData = async ({
  userTypeID,
  name,
  permission = {},
  selfUserTypeID,
}) => {
  try {
    if (await checkIsSuperAdmin(userTypeID)) {
      throw new BadRequestError("ไม่สามารถแก้ไข SuperAdmin ได้");
    }

    if (isChangedSelf(userTypeID, selfUserTypeID)) {
      throw new BadRequestError("ไม่สามารถแก้ไขสิทธิ์ตนเองได้");
    }
    const db = await mongoDB();
    const snapshot = db.collection("userType");
    await snapshot.updateOne(
      { _id: new ObjectId(userTypeID) },
      {
        $set: {
          name,
          permission,
        },
      }
    );

    return userTypeID;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const deleteUserTypeData = async ({ userTypeID, selfUserTypeID }) => {
  try {
    if (await checkIsSuperAdmin(userTypeID)) {
      throw new BadRequestError("ไม่สามารถลบ SuperAdmin ได้");
    }
    if (isChangedSelf(userTypeID, selfUserTypeID)) {
      throw new BadRequestError("ไม่สามารถแก้ไขสิทธิ์ตนเองได้");
    }
    const isHasBeenRef = await checkIsHasBeenRef(userTypeID);
    if (isHasBeenRef) {
      throw new BadRequestError("รายการนี้กำลังถูกใช้อ้างอิงอยู่");
    }

    const db = await mongoDB();
    const snapshot = db.collection("userType");
    await snapshot.updateOne(
      { _id: new ObjectId(userTypeID) },
      {
        $set: { status: 0 },
      }
    );
    return true;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const checkIsHasBeenRef = async (userTypeID) => {
  try {
    const db = await mongoDB();
    const worksnapshot = db.collection("users");
    const pipeline = [];
    pipeline.push({
      $match: {
        userTypeID: { $eq: new ObjectId(userTypeID) },
        status: { $eq: 1 },
      },
    });
    pipeline.push({ $match: {} });

    pipeline.push({ $count: "total" });
    const total = await worksnapshot.aggregate(pipeline).next();
    const totalData = total ? total.total : 0;
    if (totalData > 0) {
      return true;
    }

    return false;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

//check is SuperAdmin

const checkIsSuperAdmin = async (userTypeID) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("userType");
    const pipeline = [];
    pipeline.push({
      $match: {
        _id: { $eq: new ObjectId(userTypeID) },
        name: { $eq: "SuperAdmin" },
        status: { $eq: 1 },
      },
    });
    pipeline.push({ $count: "total" });
    const total = await snapshot.aggregate(pipeline).next();
    const totalData = total ? total.total : 0;
    if (totalData > 0) {
      return true;
    }

    return false;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const isChangedSelf = (userTypeID, selfUserTypeID) => {
  if (userTypeID === selfUserTypeID) {
    return true;
  }
  return false;
};

const getAllUserTypeCount = async (search, searchPipeline) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("userType");
    let pipeline = [];
    pipeline.push({ $match: { status: { $eq: 1 } } });
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
  getAllUserTypeCount,
  getUserTypeData,
  getUserTypeByIDData,
  addUserTypeData,
  updateUserTypeData,
  deleteUserTypeData,
};
