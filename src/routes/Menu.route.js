import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import Authentication from '../middleware/authentication.js'
import { updateRule } from '../controllers/menu/menu.controller.js';

router.post('/updateRule', Authentication(), makeExpressCallback(updateRule))


export default router;