import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import makeValidatorCallback from '../middleware/validator-callback.js'
import Authentication from '../middleware/authentication.js'
import { getHome, updateHome } from '../controllers/websiteManagement/websiteManagement.controller.js';

router.get('/get', Authentication(), makeExpressCallback(getHome))
router.put('/updateHome', Authentication(), makeExpressCallback(updateHome))
export default router;