import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import Authentication from '../middleware/authentication.js'
import { update } from '../controllers/menu/menu.controller.js';

router.post('/updateRule', Authentication(), makeExpressCallback(update))


export default router;