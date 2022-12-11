import { Router } from 'express';
const router = Router();
import { getTest, login, refreshToken } from '../controllers/auth/auth.controller.js';
import { validateLogin } from '../controllers/auth/auth.validator.js';
import makeExpressCallback from '../middleware/express-callback.js'
import makeValidatorCallback from '../middleware/validator-callback.js'
import Authentication from '../middleware/authentication.js'
/* GET programming languages. */

router.post('/signin',makeValidatorCallback(validateLogin), makeExpressCallback(login));
router.post('/refreshtoken', makeExpressCallback(refreshToken));

router.get('/testauth', Authentication(), makeExpressCallback(getTest))

export default router;