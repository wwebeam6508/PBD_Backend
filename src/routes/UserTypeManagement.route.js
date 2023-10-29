import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";
import makeValidatorCallback from "../middleware/validator-callback.js";
import Authentication from "../middleware/authentication.js";
import {
  getUserType,
  getUserTypeByID,
  updateUserType,
  addUserType,
  deleteUserType,
} from "../controllers/userTypeManagement/userTypeManagement.controller.js";
import {
  validateAddUserType,
  validateEditUserType,
} from "../controllers/userTypeManagement/userTypeManagement.validator.js";
import Permission from "../middleware/permission.js";

router.get(
  "/getUserType",
  Authentication(),
  Permission("userType", "canViewUserType"),
  makeExpressCallback(getUserType)
);
router.get(
  "/getUserTypeByID",
  Authentication(),
  Permission("userType", "canEditUserType"),
  makeExpressCallback(getUserTypeByID)
);
router.post(
  "/updateUserType",
  makeValidatorCallback(validateEditUserType),
  Authentication(),
  Permission("userType", "canEditUserType"),
  makeExpressCallback(updateUserType)
);
router.post(
  "/addUserType",
  makeValidatorCallback(validateAddUserType),
  Authentication(),
  Permission("userType", "canEditUserType"),
  makeExpressCallback(addUserType)
);
router.delete(
  "/deleteUserType",
  Authentication(),
  Permission("userType", "canRemoveUserType"),
  makeExpressCallback(deleteUserType)
);

export default router;
