import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import mongoDB from "../../configs/mongo.config.js";
import { ObjectId } from "mongodb";

const getExpenses = async ({ page = 1, pageSize = 5, sortTitle, sortType }) => {
  try {
    const offset = pageSize * (page - 1);
    const db = await mongoDB();
    const snapshot = db.collection("expenses");
    // query pagination by mongodb not firestore
    let pipeline = [];
    if (sortTitle && sortType) {
      pipeline.push({ $sort: { [sortTitle]: sortType === "desc" ? -1 : 1 } });
    }
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: pageSize });
    pipeline.push({
      $lookup: {
        from: "works",
        localField: "workRef.$id",
        foreignField: "_id",
        as: "workRef",
      },
    });

    //get data but (only title  from workRef and workRef is reference) and date to new Date
    pipeline.push({
      $project: {
        expenseID: "$_id",
        title: 1,
        date: { $toDate: "$date" },
        lists: 1,
        currentVat: 1,
        workRef: {
          $cond: {
            if: { $isArray: "$workRef" },
            then: "$workRef.title",
            else: "",
          },
        },
      },
    });
    const total = await snapshot.aggregate(pipeline).toArray();

    const data = total.map((res) => {
      return {
        ...res,
        workRef: res.workRef ? res.workRef[0] : "",
      };
    });
    return data;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getExpenseByID = async ({ expenseID }) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("expenses");
    // query expense find objectid by expenseID and get workRef
    let pipeline = [];
    pipeline.push({ $match: { _id: new ObjectId(expenseID) } });
    pipeline.push({
      $lookup: {
        from: "works",
        localField: "workRef.$id",
        foreignField: "_id",
        as: "workRef",
      },
    });
    // workRef get only $id
    pipeline.push({
      $project: {
        expenseID: "$_id",
        title: 1,
        date: { $toDate: "$date" },
        lists: 1,
        currentVat: 1,
        detail: 1,
        workRef: {
          $cond: {
            if: { $isArray: "$workRef" },
            then: "$workRef._id",
            else: "",
          },
        },
      },
    });
    // get all data
    const data = await snapshot.aggregate(pipeline).next();
    return {
      ...data,
      workRef: data.workRef ? data.workRef[0] : "",
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addExpense = async ({
  title,
  date = new Date(date),
  workRef,
  detail,
  lists = [],
  currentVat,
}) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("expenses");
    let passData = {
      title,
      date,
      workRef: {
        $ref: "works",
        $id: workRef ? new ObjectId(workRef) : null,
      },
      detail,
      lists,
      currentVat,
    };
    const expenseQuery = await snapshot.insertOne(passData);
    return expenseQuery.insertedId;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateExpense = async ({
  expenseID,
  title,
  date = new Date(date),
  workRef,
  detail,
  addLists = [],
  removeLists = [],
  currentVat = 0,
}) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("expenses");
    let passData = {
      title,
      date,
      workRef: {
        $ref: "works",
        $id: workRef ? new ObjectId(workRef) : null,
      },
      detail,
      currentVat,
    };
    const expenseQuery = await snapshot.updateOne(
      { _id: new ObjectId(expenseID) },
      {
        $set: passData,
      }
    );
    if (addLists.length > 0)
      await snapshot.updateOne(
        { _id: new ObjectId(expenseID) },
        {
          $addToSet: { lists: { $each: addLists } },
        }
      );
    if (removeLists.length > 0)
      await snapshot.updateOne(
        { _id: new ObjectId(expenseID) },
        {
          $pull: { lists: { $in: removeLists } },
        }
      );

    return expenseQuery.upsertedId;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const deleteExpense = async ({ expenseID }) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("expenses");
    await snapshot.deleteOne({
      _id: new ObjectId(expenseID),
    });
    return true;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getExpensesCount = async () => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("expenses");
    const total = await snapshot.countDocuments();
    return total;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getWorksTitle = async () => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("works");
    // get it by aggrate
    let pipeline = [];
    pipeline.push({
      $project: {
        id: "$_id",
        title: 1,
      },
    });
    const total = await snapshot.aggregate(pipeline).toArray();
    return total;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  getExpensesCount,
  getExpenses,
  getExpenseByID,
  addExpense,
  updateExpense,
  deleteExpense,
  getWorksTitle,
};
