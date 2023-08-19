import { Router } from "express";
const router = Router();

import makeExpressCallback from "../middleware/express-callback.js";
import Authentication from "../middleware/authentication.js";

import {
  backupFirestore,
  migrateToMongo,
} from "../controllers/migrate/migrate.controller.js";

router.get("/backup", Authentication(), makeExpressCallback(backupFirestore));
router.get(
  "/migrateMongo",
  Authentication(),
  makeExpressCallback(migrateToMongo)
);

export default router;
