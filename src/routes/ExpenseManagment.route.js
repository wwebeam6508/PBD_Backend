import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";
import makeValidatorCallback from "../middleware/validator-callback.js";

import Authentication from "../middleware/authentication.js";

import {
  addExpense,
  deleteExpense,
  getExpenseByID,
  getExpensesPagination,
  updateExpense,
  getProjectTitle,
} from "../controllers/expenseManagement/expenseManagement.controller.js";

import {
  validateAddExpense,
  validateDeleteExpense,
  validateUpdateExpense,
} from "../controllers/expenseManagement/expenseManagement.validator.js";

router.get(
  "/get",
  Authentication(),
  makeExpressCallback(getExpensesPagination)
);
router.get("/getByID", Authentication(), makeExpressCallback(getExpenseByID));
router.post(
  "/add",
  makeValidatorCallback(validateAddExpense),
  Authentication(),
  makeExpressCallback(addExpense)
);
router.delete(
  "/delete",
  makeValidatorCallback(validateDeleteExpense),
  Authentication(),
  makeExpressCallback(deleteExpense)
);
router.post(
  "/update",
  makeValidatorCallback(validateUpdateExpense),
  Authentication(),
  makeExpressCallback(updateExpense)
);
router.get(
  "/getProjectTitle",
  Authentication(),
  makeExpressCallback(getProjectTitle)
);

export default router;
