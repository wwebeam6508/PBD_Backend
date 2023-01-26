import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import makeValidatorCallback from '../middleware/validator-callback.js'
import Authentication from '../middleware/authentication.js'
import { getContactUs, getHome, updateContactUs, updateHome } from '../controllers/websiteManagement/websiteManagement.controller.js';

router.get('/getHome', Authentication(), makeExpressCallback(getHome))
router.put('/updateHome', Authentication(), makeExpressCallback(updateHome))
router.get('/getContactUs', Authentication(), makeExpressCallback(getContactUs))
router.put('/updateContactUs', Authentication(), makeExpressCallback(updateContactUs))
export default router;