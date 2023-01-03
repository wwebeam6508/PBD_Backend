import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import Authentication from '../middleware/authentication.js'
import { getMenu, updateRule } from '../controllers/menu/menu.controller.js';

router.post('/updateRule', Authentication(), makeExpressCallback(updateRule))
router.get('/get', Authentication(), makeExpressCallback(getMenu))

export default router;