import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";
import makeValidatorCallback from "../middleware/validator-callback.js";
import Authentication from "../middleware/authentication.js";
import {
  addWork,
  deleteWork,
  getCustomerName,
  getWorkByID,
  getWorkPagination,
  updateWork,
} from "../controllers/projectManagement/projectManagement.controller.js";
import {
  validateAddWork,
  validateDeleteWork,
  validateUpdateWork,
} from "../controllers/projectManagement/projectManagement.validator.js";
import Permission from "../middleware/permission.js";

router.get(
  "/get",
  Authentication(),
  Permission("project", "canView"),
  makeExpressCallback(getWorkPagination)
);
router.get("/getByID", Authentication(), makeExpressCallback(getWorkByID));
router.post(
  "/add",
  makeValidatorCallback(validateAddWork),
  Authentication(),
  Permission("project", "canEdit"),
  makeExpressCallback(addWork)
);
router.delete(
  "/delete",
  makeValidatorCallback(validateDeleteWork),
  Authentication(),
  Permission("project", "canRemove"),
  makeExpressCallback(deleteWork)
);
router.post(
  "/update",
  makeValidatorCallback(validateUpdateWork),
  Authentication(),
  Permission("project", "canEdit"),
  makeExpressCallback(updateWork)
);
router.get(
  "/getCustomerName",
  Authentication(),
  makeExpressCallback(getCustomerName)
);
export default router;
