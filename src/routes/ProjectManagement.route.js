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
  Permission("project", "canViewProject"),
  makeExpressCallback(getWorkPagination)
);
router.get("/getByID", Authentication(), makeExpressCallback(getWorkByID));
router.post(
  "/add",
  makeValidatorCallback(validateAddWork),
  Authentication(),
  Permission("project", "canEditProject"),
  makeExpressCallback(addWork)
);
router.delete(
  "/delete",
  makeValidatorCallback(validateDeleteWork),
  Authentication(),
  Permission("project", "canRemoveProject"),
  makeExpressCallback(deleteWork)
);
router.post(
  "/update",
  makeValidatorCallback(validateUpdateWork),
  Authentication(),
  Permission("project", "canEditProject"),
  makeExpressCallback(updateWork)
);
router.get(
  "/getCustomerName",
  Authentication(),
  makeExpressCallback(getCustomerName)
);
export default router;
