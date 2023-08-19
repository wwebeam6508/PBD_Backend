import firestoreBackup from "@sgg10/firestore-backup";
import { createRequire } from "module";
import mongoDB from "../../configs/mongo.config.js";
import { BadRequestError } from "../../utils/api-errors.js";
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
            value1.customer = {
              $ref: "customers",
              $id: value1.customer._path.segments[1],
            };
          } else {
            value1.customer = {
              $ref: "customers",
              $id: "",
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
        }
        if (key === "expenses") {
          if (value1.date && value1.date._seconds) {
            value1.date = new Date(value1.date._seconds * 1000);
          } else if (value1.date) {
            value1.date = new Date(value1.date);
          }
          if (value1.workRef && value1.workRef._path) {
            value1.workRef = {
              $ref: "works",
              $id: value1.workRef._path.segments[1],
            };
          } else {
            value1.workRef = {
              $ref: "works",
              $id: "",
            };
          }
        }
        collection.insertOne({
          _id: key1,
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
