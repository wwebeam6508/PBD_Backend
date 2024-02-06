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
  Permission("user", "canView"),
  makeExpressCallback(getUser)
);
router.get(
  "/getUserByID",
  Authentication(),
  Permission("user", "canEdit"),
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
  Permission("user", "canEdit"),
  makeExpressCallback(updateUser)
);
router.post(
  "/addUser",
  makeValidatorCallback(validateAddUser),
  Authentication(),
  Permission("user", "canEdit"),
  makeExpressCallback(addUser)
);
router.delete(
  "/deleteUser",
  Authentication(),
  Permission("user", "canRemove"),
  makeExpressCallback(deleteUser)
);

export default router;
