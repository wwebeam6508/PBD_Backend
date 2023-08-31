import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";
import makeValidatorCallback from "../middleware/validator-callback.js";

import Authentication from "../middleware/authentication.js";

import {
  getDashboard,
  getEarnAndSpendEachYear,
  getTotalEarn,
  getTotalExpense,
  getTotalWork,
  getYearsReport,
} from "../controllers/dashboard/dashboard.controller.js";

import {
  getTotalEarnValidator,
  getTotalExpenseValidator,
  getEarnAndSpendEachYearValidator,
} from "../controllers/dashboard/dashboard.validator.js";

router.get(
  "/getEarnAndSpendEachYear",
  makeValidatorCallback(getEarnAndSpendEachYearValidator),
  Authentication(),
  makeExpressCallback(getEarnAndSpendEachYear)
);

router.get(
  "/getTotalEarn",
  makeValidatorCallback(getTotalEarnValidator),
  Authentication(),
  makeExpressCallback(getTotalEarn)
);

router.get(
  "/getTotalExpense",
  makeValidatorCallback(getTotalExpenseValidator),
  Authentication(),
  makeExpressCallback(getTotalExpense)
);

router.get(
  "/getYearsReport",
  Authentication(),
  makeExpressCallback(getYearsReport)
);

router.get(
  "/getTotalWork",
  Authentication(),
  makeExpressCallback(getTotalWork)
);

router.get(
  "/getDashboard",
  Authentication(),
  makeExpressCallback(getDashboard)
);

export default router;
