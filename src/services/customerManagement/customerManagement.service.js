import { BadRequestError } from "../../utils/api-errors.js";
import mongoDB from "../../configs/mongo.config.js";
import { ObjectId } from "mongodb";

const getCustomers = async ({
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
    const snapshot = db.collection("customers");
    let pipeline = [];
    if (sortTitle && sortType) {
      pipeline.push({ $sort: { [sortTitle]: sortType === "desc" ? -1 : 1 } });
    }
    if (search) {
      //merge searchPipeline with pipeline
      pipeline = [...searchPipeline, ...pipeline];
    }

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: pageSize });
    // get only customerID and name and address and taxID
    pipeline.push({
      $project: {
        customerID: "$_id",
        name: 1,
        address: 1,
        taxID: 1,
      },
    });
    const total = await snapshot.aggregate(pipeline).toArray();
    return total;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getCustomerByID = async ({ customerID }) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("customers");
    let pipeline = [];
    pipeline.push({
      $match: { _id: new ObjectId(customerID), status: { $eq: 1 } },
    });
    // get only customerID and name and address and taxID
    pipeline.push({
      $project: {
        customerID: "$_id",
        name: 1,
        address: 1,
        taxID: 1,
        emails: 1,
        phones: 1,
      },
    });
    const res = await snapshot.aggregate(pipeline).next();
    return res;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addCustomer = async ({
  name,
  address = "",
  taxID = "",
  phones = [],
  emails = [],
}) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("customers");
    const customerQuery = await snapshot.insertOne({
      name,
      address,
      taxID,
      phones,
      emails,
    });
    return customerQuery.insertedId;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateCustomer = async ({
  customerID,
  name,
  address = "",
  taxID = "",
  addPhones = [],
  addEmails = [],
  removePhones = [],
  removeEmails = [],
}) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("customers");
    await snapshot.updateOne(
      { _id: new ObjectId(customerID) },
      {
        $set: {
          name,
          address,
          taxID,
        },
      }
    );
    if (addPhones.length > 0) {
      await snapshot.updateOne(
        { _id: new ObjectId(customerID) },
        {
          $push: {
            phones: { $each: addPhones },
          },
        }
      );
    }
    if (addEmails.length > 0) {
      await snapshot.updateOne(
        { _id: new ObjectId(customerID) },
        {
          $push: {
            emails: { $each: addEmails },
          },
        }
      );
    }
    if (removePhones.length > 0) {
      await snapshot.updateOne(
        { _id: new ObjectId(customerID) },
        {
          $pull: {
            phones: { $in: removePhones },
          },
        }
      );
    }
    if (removeEmails.length > 0) {
      await snapshot.updateOne(
        { _id: new ObjectId(customerID) },
        {
          $pull: {
            emails: { $in: removeEmails },
          },
        }
      );
    }

    return customerID;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const deleteCustomer = async ({ customerID }) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("customers");
    await snapshot.deleteOne({
      _id: new ObjectId(customerID),
    });
    return true;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getCustomersCount = async (search, searchPipeline) => {
  try {
    const db = await mongoDB();
    const snapshot = db.collection("customers");
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
  getCustomersCount,
  getCustomers,
  getCustomerByID,
  addCustomer,
  updateCustomer,
  deleteCustomer,
};
