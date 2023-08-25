import firestoreBackup from "@sgg10/firestore-backup";
import { createRequire } from "module";
import mongoDB from "../../configs/mongo.config.js";
import { BadRequestError } from "../../utils/api-errors.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";
const require = createRequire(import.meta.url);
const serviceAccount = require("../../../serviceAccount.json");
const AllJson = require("../../../All.json");

async function backupFirestore() {
  // Export all data from Firestore
  try {
    let fsb = new firestoreBackup(serviceAccount);
    const data = await fsb.exportAll();
    // Save data to a file
    fsb.saveFile(data, { name: "All" });
  } catch (error) {
    throw new BadRequestError(error.message);
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: 200,
    body: {
      message: "Backup Firestore",
    },
  };
}

async function migrateToMongo() {
  try {
    let data = AllJson;
    const database = await mongoDB();
    //data is object for each collection
    for (const [key, value] of Object.entries(data)) {
      const collection = database.collection(key);
      for (const [key1, value1] of Object.entries(value)) {
        if (key === "works") {
          //replace customer with $ref :customer._path.segments[1]
          if (value1.customer && value1.customer._path) {
            const hexString = crypto
              .createHash("md5")
              .update(value1.customer._path.segments[1])
              .digest("hex")
              .slice(0, 24);
            const objectId = new ObjectId(hexString);
            value1.customer = {
              $ref: "customers",
              $id: objectId,
            };
          } else {
            value1.customer = {
              $ref: "customers",
              $id: null,
            };
          }
          if (value1.date && value1.date._seconds) {
            value1.date = new Date(value1.date._seconds * 1000);
          } else if (value1.date) {
            value1.date = new Date(value1.date);
          }
          if (value1.dateEnd && value1.dateEnd._seconds) {
            value1.dateEnd = new Date(value1.dateEnd._seconds * 1000);
          } else if (value1.dateEnd) {
            value1.dateEnd = new Date(value1.dateEnd);
          }
        }
        if (key === "users") {
          if (value1.createdAt && value1.createdAt._seconds) {
            value1.createdAt = new Date(value1.createdAt._seconds * 1000);
          } else if (value1.createdAt) {
            value1.createdAt = new Date(value1.createdAt);
          }
          if (value1.userTypeID) {
            const hexString = crypto
              .createHash("md5")
              .update(value1.userTypeID)
              .digest("hex")
              .slice(0, 24);
            const objectId = new ObjectId(hexString);
            value1.userTypeID = {
              $ref: "userType",
              $id: objectId,
            };
          } else {
            value1.userTypeID = {
              $ref: "userType",
              $id: null,
            };
          }
        }
        if (key === "expenses") {
          if (value1.date && value1.date._seconds) {
            value1.date = new Date(value1.date._seconds * 1000);
          } else if (value1.date) {
            value1.date = new Date(value1.date);
          }
          if (value1.workRef && value1.workRef._path) {
            const hexString = crypto
              .createHash("md5")
              .update(value1.workRef._path.segments[1])
              .digest("hex")
              .slice(0, 24);
            const objectId = new ObjectId(hexString);
            value1.workRef = {
              $ref: "works",
              $id: objectId,
            };
          } else {
            value1.workRef = {
              $ref: "works",
              $id: null,
            };
          }
        }

        // genearte hex string 24 length by seed key1

        const hexString = crypto
          .createHash("md5")
          .update(key1)
          .digest("hex")
          .slice(0, 24);
        const objectId = new ObjectId(hexString);

        collection.insertOne({
          _id: objectId,
          ...value1,
        });
      }
    }
  } catch (error) {
    throw new BadRequestError(error.message);
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

export { backupFirestore, migrateToMongo };
