import { Router } from "express";
const router = Router();

import makeExpressCallback from "../middleware/express-callback.js";
import Authentication from "../middleware/authentication.js";

import {
  backupDatabaseMongo,
  insertStatus,
  mergePermission,
  mongoMigrationToMongo,
} from "../controllers/migrate/migrate.controller.js";
import Permission from "../middleware/permission.js";

router.get(
  "/mongoMigrationToMongo",
  Authentication(),
  Permission("SuperAdmin", ""),
  makeExpressCallback(mongoMigrationToMongo)
);
router.get(
  "/backupDatabaseMongo",
  Authentication(),
  Permission("SuperAdmin", ""),
  makeExpressCallback(backupDatabaseMongo)
);
router.get(
  "/insertStatus",
  Authentication(),
  Permission("SuperAdmin", ""),
  makeExpressCallback(insertStatus)
);
router.get(
  "/mergePermission",
  Authentication(),
  Permission("SuperAdmin", ""),
  makeExpressCallback(mergePermission)
);

export default router;
