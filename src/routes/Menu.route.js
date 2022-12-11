import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import Authentication from '../middleware/authentication.js'
import { updateAllowUserType } from '../controllers/menu/menu.controller.js';

router.post('/updateRule', Authentication(), makeExpressCallback(updateAllowUserType))


export default router;