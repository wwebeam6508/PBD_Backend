import { Router } from "express";
const router = Router();
import makeExpressCallback from "../middleware/express-callback.js";
import makeValidatorCallback from "../middleware/validator-callback.js";
import Authentication from "../middleware/authentication.js";
import {
  addCustomer,
  deleteCustomer,
  getCustomerByID,
  getCustomersPagination,
  updateCustomer,
} from "../controllers/customerManagement/customerManagement.controller.js";
import {
  validateAddCustomer,
  validateDeleteCustomer,
  validateUpdateCustomer,
} from "../controllers/customerManagement/customerManagement.validator.js";

router.get(
  "/get",
  Authentication(),
  makeExpressCallback(getCustomersPagination)
);
router.get("/getByID", Authentication(), makeExpressCallback(getCustomerByID));
router.post(
  "/add",
  makeValidatorCallback(validateAddCustomer),
  Authentication(),
  makeExpressCallback(addCustomer)
);
router.delete(
  "/delete",
  makeValidatorCallback(validateDeleteCustomer),
  Authentication(),
  makeExpressCallback(deleteCustomer)
);
router.post(
  "/update",
  makeValidatorCallback(validateUpdateCustomer),
  Authentication(),
  makeExpressCallback(updateCustomer)
);
export default router;
