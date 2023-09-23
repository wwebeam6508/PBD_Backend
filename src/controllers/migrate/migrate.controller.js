// import firestoreBackup from "@sgg10/firestore-backup";
import { createRequire } from "module";
import mongoDB from "../../configs/mongo.config.js";
import { BadRequestError } from "../../utils/api-errors.js";
import fs from "fs";
import { ObjectId } from "mongodb";
import crypto from "crypto";
const require = createRequire(import.meta.url);
// const serviceAccount = require("../../../serviceAccount.json");

const AllJson = require("../../../backup.json");

async function mongoMigrationToMongo() {
  let data = AllJson;
  const database = await mongoDB();
  //data is object for each collection
  for (const [key, value] of Object.entries(data)) {
    const collection = database.collection(key);
    for (const [key1, value1] of Object.entries(value)) {
      console.log(key1);
      if (key === "expenses") {
        if (value1.lists && value1.lists.length > 0) {
          //put objectId to lists
          for (let i = 0; i < value1.lists.length; i++) {
            if (!value1.lists[i]._id) {
              const hexString = crypto
                .createHash("md5")
                .update(`${i}`)
                .digest("hex")
                .slice(0, 24);
              const objectId = new ObjectId(hexString);
              value1.lists[i] = {
                _id: objectId,
                ...value1.lists[i],
              };
            }
          }
        }
        if (value1.workRef && value1.workRef.$id) {
          const objectId = new ObjectId(value1.workRef.$id);
          value1.workRef = {
            $ref: "works",
            $id: objectId,
          };
        }
      }
      if (key === "works") {
        if (value1.customer && value1.customer.$id) {
          const objectId = new ObjectId(value1.customer.$id);
          value1.customer = {
            $ref: "customers",
            $id: objectId,
          };
        }
      }
      //check any value1 is stringdate if it is then convert to date
      for (const [key2, value2] of Object.entries(value1)) {
        if (key2 === "date" || key2 === "dateEnd" || key2 === "createdAt") {
          value1[key2] = new Date(value2);
        }
      }

      const objectId = new ObjectId(value1._id);
      collection.insertOne({
        ...value1,
        _id: objectId,
      });
    }
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: 200,
    body: {
      message: "Migrate to Mongo",
    },
  };
}

async function backupDatabaseMongo() {
  try {
    const db = await mongoDB();
    const collections = await db.listCollections().toArray();
    const docs = {};
    for (const collection of collections) {
      const collectionDocs = await db
        .collection(collection.name)
        .find()
        .toArray();
      docs[collection.name] = collectionDocs;
    }

    fs.writeFileSync("All.json", JSON.stringify(docs));

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      body: {
        message: "export",
      },
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
}

async function insertStatus() {
  const table = ["users", "userType", "customers", "works", "expenses"];
  const db = await mongoDB();
  //insert every collection with status as 1
  try {
    for (let i = 0; i < table.length; i++) {
      const collection = db.collection(table[i]);
      await collection.updateMany({}, { $set: { status: 1 } });
    }
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      body: {
        message: "insert status",
      },
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
}

export { backupDatabaseMongo, mongoMigrationToMongo, insertStatus };
