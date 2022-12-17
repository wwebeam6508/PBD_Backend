import { Router } from 'express';
const router = Router();
import makeExpressCallback from '../middleware/express-callback.js'
import Authentication from '../middleware/authentication.js'
import { getWorkPagination } from '../controllers/projectManagement/projectManagement.controller.js';

router.get('/get/:page', Authentication(), makeExpressCallback(getWorkPagination))


export default router;