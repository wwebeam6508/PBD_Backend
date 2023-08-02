import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";

import Authentication from "../middleware/authentication.js";

import { getEarnAndSpendEachYear } from "../controllers/dashboard/dashboard.controller.js";

router.get(
  "/getEarnAndSpendEachYear",
  Authentication(),
  makeExpressCallback(getEarnAndSpendEachYear)
);

export default router;
