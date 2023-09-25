import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import { uploadFiletoStorage } from "../../utils/helper.util.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
const env = dotenv.config().parsed;

import mongoDB from "../../configs/mongo.config.js";
import { ObjectId } from "mongodb";

const getWorks = async ({
  page = 1,
  pageSize = 2,
  sortTitle,
  sortType,
  search,
  searchPipeline,
}) => {
  try {
    const offset = pageSize * (page - 1);
    const db = await mongoDB();
    const snapshot = db.collection("works");
    // query pagination by mongodb not firestore
    let pipeline = [];
    pipeline.push({ $match: { status: { $eq: 1 } } });
    if (sortTitle && sortType) {
      pipeline.push({ $sort: { [sortTitle]: sortType === "desc" ? -1 : 1 } });
    }
    if (search) {
      //merge searchPipeline with pipeline
      pipeline = [...searchPipeline, ...pipeline];
    }
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: pageSize });
    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "customer.$id",
        foreignField: "_id",
        as: "customer",
      },
    });

    //get data but (only title  from workRef and workRef is reference) and date to new Date
    pipeline.push({
      $project: {
        projectID: "$_id",
        title: 1,
        date: { $toDate: "$date" },
        profit: 1,
        dateEnd: { $toDate: "$dateEnd" },
        customer: {
          $cond: {
            if: { $isArray: "$customer" },
            then: "$customer.name",
            else: "",
          },
        },
      },
    });
    const total = await snapshot.aggregate(pipeline).toArray();

    const data = total.map((res) => {
      return {
        ...res,
        customer: res.customer ? res.customer[0] : "",
      };
    });
    return data;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getWorksByID = async ({ workID }) => {
  const db = await mongoDB();
  try {
    const snapshot = db.collection("works");
    let pipeline = [];
    pipeline.push({
      $match: { _id: new ObjectId(workID), status: { $eq: 1 } },
    });
    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "customer.$id",
        foreignField: "_id",
        as: "customer",
      },
    });
    pipeline.push({
      $project: {
        projectID: "$_id",
        title: 1,
        date: { $toDate: "$date" },
        profit: 1,
        dateEnd: { $toDate: "$dateEnd" },
        detail: 1,
        customer: {
          $cond: {
            if: { $isArray: "$customer" },
            then: "$customer._id",
            else: "",
          },
        },
        images: 1,
      },
    });
    const total = await snapshot.aggregate(pipeline).next();
    return {
      ...total,
      customer: total.customer ? total.customer[0] : "",
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addWork = async ({
  title,
  date = new Date(date),
  dateEnd,
  detail = "",
  profit = 0,
  images = [],
  customer,
}) => {
  const firstAdd = {
    title,
    date: date,
    detail,
    profit,
    dateEnd: dateEnd ? dateEnd : null,
    customer: customer ? customer : null,
  };
  try {
    const db = await mongoDB();
    const snapshot = db.collection("works");
    await snapshot
      .insertOne({
        ...firstAdd,
        customer: customer
          ? {
              $ref: "customers",
              $id: customer ? new ObjectId(customer) : null,
            }
          : null,
        status: 1,
      })
      .catch((error) => {
        throw new BadRequestError(error.message);
      });
    const workID = firstAdd._id;
    if (images.length > 0) {
      const urlData = await uploadStorageForProjects(images, "works", workID);
      await snapshot
        .updateOne({ _id: new ObjectId(workID) }, { $set: { images: urlData } })
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
    }

    return {
      workID: workID,
      date: date,
    };

    // const db = admin.firestore();
    // await db
    //   .collection("works")
    //   .add(firstAdd)
    //   .catch((error) => {
    //     throw new BadRequestError(error.message);
    //   })
    //   .then(async (res) => {
    //     const workID = res.id;
    //     if (images.length > 0) {
    //       const urlData = await uploadStorageForProjects(
    //         images,
    //         "works",
    //         workID
    //       );
    //       await db
    //         .collection("works")
    //         .doc(workID)
    //         .update({ images: urlData })
    //         .catch((error) => {
    //           throw new BadRequestError(error.message);
    //         });
    //     }
    //   });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const deleteWork = async ({ workID }) => {
  const mongo_DB = await mongoDB();
  const storage = admin.storage();

  try {
    const expenseDoc = mongo_DB.collection("expenses");
    let pipeline = [];
    pipeline.push({
      $match: { "workRef.$id": new ObjectId(workID), status: { $eq: 1 } },
    });
    pipeline.push({ $project: { title: 1 } });
    const expenseData = await expenseDoc.aggregate(pipeline).toArray();
    if (expenseData.length > 0) {
      const nameOfExpenses = expenseData.map((res) => res.title);
      let listMessage = "";
      nameOfExpenses.forEach((name) => {
        listMessage += `-${name}, `;
      });
      listMessage = listMessage.substring(0, listMessage.length - 2);

      return {
        status: false,
        message: `ไม่สามารถลบงานได้เนื่องจากมีรายการค่าใช้จ่ายที่อ้างอิงถึงงานนี้ โดยมีรายการค่าใช้จ่ายดังนี้ ${listMessage}`,
      };
    }
    const workData = await getWorksByID({ workID });
    const year = workData.date.getFullYear();
    if (workData.images && workData.images.length > 0) {
      await Promise.all(
        workData.images.map(async (image) => {
          const fileName = `works/${getPathStorageFromUrl(image)}`;
          await storage
            .bucket()
            .file(fileName)
            .delete()
            .catch((error) => {
              throw new BadRequestError(error.message);
            });
        })
      );
    }
    const workDoc = mongo_DB.collection("works");
    // update status to 0
    await workDoc
      .updateOne({ _id: new ObjectId(workID) }, { $set: { status: 0 } })
      .catch((error) => {
        throw new BadRequestError(error.message);
      });

    return {
      status: true,
      year: year,
      message: "ลบงานสำเร็จ",
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateWork = async ({
  workID,
  title,
  date = new Date(date),
  dateEnd,
  detail = "",
  profit = 0,
  customer,
  imagesDelete = [],
  imagesAdd = [],
}) => {
  let body = {
    title,
    date: date,
    detail,
    profit,
    customer: {
      $ref: "customers",
      $id: customer ? new ObjectId(customer) : null,
    },
    dateEnd: dateEnd ? dateEnd : null,
  };
  try {
    const db = await mongoDB();
    const snapshot = db.collection("works");
    await snapshot
      .updateOne({ _id: new ObjectId(workID) }, { $set: body })
      .catch((error) => {
        throw new BadRequestError(error.message);
      });
    if (imagesDelete.length > 0) {
      //delete file in storage by url
      await Promise.all(
        imagesDelete.map(async (image) => {
          const fileName = `works/${getPathStorageFromUrl(image)}`;
          const file = admin.storage().bucket().file(fileName);
          await file.delete();
        })
      );
      await snapshot
        .updateOne(
          { _id: new ObjectId(workID) },
          {
            //array remove
            $pull: { images: { $in: imagesDelete } },
          }
        )
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
    }
    if (imagesAdd.length > 0) {
      //add file in storage by url
      const urlData = await uploadStorageForProjects(
        imagesAdd,
        "works",
        workID
      );
      await snapshot
        .updateOne(
          { _id: new ObjectId(workID) },
          {
            //array union
            $addToSet: { images: { $each: urlData } },
          }
        )
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
    }
    return {
      workID: workID,
      date: date,
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

function getPathStorageFromUrl(url) {
  const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${env.STORAGEBUCKET}/o/`;

  let imagePath = url.replace(baseUrl, "");

  const indexOfEndPath = imagePath.indexOf("?");

  imagePath = imagePath.substring(0, indexOfEndPath);

  imagePath = imagePath.replace("%2F", "/");
  imagePath = imagePath.split("/");
  imagePath = imagePath[imagePath.length - 1];
  return imagePath;
}

const getAllWorksCount = async (search, searchPipeline) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("works");
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

const getCustomerName = async () => {
  try {
    const mongo_DB = await mongoDB();
    const snapshot = mongo_DB.collection("customers");
    let pipeline = [];
    pipeline.push({ $match: { status: { $eq: 1 } } });
    pipeline.push({ $project: { id: "$_id", name: 1 } });
    const total = await snapshot.aggregate(pipeline).toArray();
    return total;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const uploadStorageForProjects = async (images, path, workID) => {
  let imagesURL = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filename = `${workID}_${i}`;
    const url = await uploadFiletoStorage(image, path, filename);
    imagesURL.push(url);
  }
  return imagesURL;
};

export {
  deleteWork,
  addWork,
  updateWork,
  getWorks,
  getAllWorksCount,
  getCustomerName,
  getWorksByID,
};
