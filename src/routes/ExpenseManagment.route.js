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
  getSellerName,
} from "../controllers/expenseManagement/expenseManagement.controller.js";

import {
  validateAddExpense,
  validateDeleteExpense,
  validateUpdateExpense,
} from "../controllers/expenseManagement/expenseManagement.validator.js";
import Permission from "../middleware/permission.js";

router.get(
  "/get",
  Authentication(),
  Permission("expense", "canView"),
  makeExpressCallback(getExpensesPagination)
);
router.get(
  "/getByID",
  Authentication(),
  Permission("expense", "canEdit"),
  makeExpressCallback(getExpenseByID)
);
router.post(
  "/add",
  makeValidatorCallback(validateAddExpense),
  Authentication(),
  Permission("expense", "canEdit"),
  makeExpressCallback(addExpense)
);
router.delete(
  "/delete",
  makeValidatorCallback(validateDeleteExpense),
  Authentication(),
  Permission("expense", "canRemove"),
  makeExpressCallback(deleteExpense)
);
router.post(
  "/update",
  makeValidatorCallback(validateUpdateExpense),
  Authentication(),
  Permission("expense", "canEdit"),
  makeExpressCallback(updateExpense)
);
router.get(
  "/getProjectTitle",
  Authentication(),
  makeExpressCallback(getProjectTitle)
);
router.get(
  "/getSellerName",
  Authentication(),
  makeExpressCallback(getSellerName)
);

export default router;
