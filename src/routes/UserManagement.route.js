import { Router } from 'express'
const router = Router()
import makeExpressCallback from '../middleware/express-callback.js'
import makeValidatorCallback from '../middleware/validator-callback.js'
import Authentication from '../middleware/authentication.js'
import { getUser, getUserByID, getUserType, getUserTypeByID, updateUser, addUser, deleteUser } from '../controllers/userManagement/userManagement.controller.js'
import { validateAddUser, validateEditUser } from '../controllers/userManagement/userManagement.validator.js'

router.get('/getUser/:page', Authentication(), makeExpressCallback(getUser))
router.get('/getUserByID/:id', Authentication(), makeExpressCallback(getUserByID))
router.get('/getUserType', Authentication(), makeExpressCallback(getUserType))
router.get('/getUserTypeByID/:id', Authentication(), makeExpressCallback(getUserTypeByID))
router.put('/updateUser/:id', makeValidatorCallback(validateEditUser), Authentication(), makeExpressCallback(updateUser))
router.post('/addUser', makeValidatorCallback(validateAddUser), Authentication(), makeExpressCallback(addUser))
router.delete('/deleteUser/:id', Authentication(), makeExpressCallback(deleteUser))

export default router