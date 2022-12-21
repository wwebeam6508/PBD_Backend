import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import makeValidatorCallback from '../middleware/validator-callback.js'
import Authentication from '../middleware/authentication.js'
import { addWork, deleteWork, getWorkPagination, updateWork } from '../controllers/projectManagement/projectManagement.controller.js';
import { validateAddWork, validateDeleteWork, validateUpdateWork } from '../controllers/projectManagement/projectManagement.validator.js';

router.get('/get/:page', Authentication(), makeExpressCallback(getWorkPagination))
router.post('/add', makeValidatorCallback(validateAddWork), Authentication(), makeExpressCallback(addWork))
router.delete('/delete', makeValidatorCallback(validateDeleteWork), Authentication(), makeExpressCallback(deleteWork))
router.post('/update', makeValidatorCallback(validateUpdateWork), Authentication(), makeExpressCallback(updateWork))
export default router;