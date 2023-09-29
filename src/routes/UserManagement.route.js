import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";
import makeValidatorCallback from "../middleware/validator-callback.js";
import Authentication from "../middleware/authentication.js";
import {
  getUser,
  getUserByID,
  getUserTypeName,
  updateUser,
  addUser,
  deleteUser,
} from "../controllers/userManagement/userManagement.controller.js";
import {
  validateAddUser,
  validateEditUser,
} from "../controllers/userManagement/userManagement.validator.js";
import Permission from "../middleware/permission.js";

router.get(
  "/getUser",
  Authentication(),
  Permission("user", "canViewUser"),
  makeExpressCallback(getUser)
);
router.get(
  "/getUserByID",
  Authentication(),
  Permission("user", "canEditUser"),
  makeExpressCallback(getUserByID)
);
router.get(
  "/getUserTypeName",
  Authentication(),
  makeExpressCallback(getUserTypeName)
);
router.post(
  "/updateUser",
  makeValidatorCallback(validateEditUser),
  Authentication(),
  Permission("user", "canEditUser"),
  makeExpressCallback(updateUser)
);
router.post(
  "/addUser",
  makeValidatorCallback(validateAddUser),
  Authentication(),
  Permission("user", "canEditUser"),
  makeExpressCallback(addUser)
);
router.delete(
  "/deleteUser",
  Authentication(),
  Permission("user", "canRemoveUser"),
  makeExpressCallback(deleteUser)
);

export default router;
