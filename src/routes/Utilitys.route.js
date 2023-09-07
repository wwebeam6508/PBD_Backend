import { Router } from "express";
const router = Router();

import makeExpressCallback from "../middleware/express-callback.js";
import Authentication from "../middleware/authentication.js";

import {
  backupFirestore,
  migrateToMongo,
  backupDatabaseMongo,
  mongoMigrationToMongo,
} from "../controllers/migrate/migrate.controller.js";

router.get("/backup", Authentication(), makeExpressCallback(backupFirestore));
router.get(
  "/migrateMongo",
  Authentication(),
  makeExpressCallback(migrateToMongo)
);
router.get(
  "/mongoMigrationToMongo",
  Authentication(),
  makeExpressCallback(mongoMigrationToMongo)
);
router.get(
  "/backupDatabaseMongo",
  Authentication(),
  makeExpressCallback(backupDatabaseMongo)
);

export default router;
