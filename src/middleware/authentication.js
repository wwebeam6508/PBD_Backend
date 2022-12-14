import jwt from 'jsonwebtoken'
import { AccessDeniedError } from '../utils/api-errors.js'
import env from '../../env_config.json'assert { type: "json" };
export default () => (req, res, next) => {
    try {
        const token = req.header("Authorization").split(' ')[1];
        const decoded = jwt.verify(
            token, 
            env.JWT_ACCESS_TOKEN_SECRET, 
            env.JWT_ACCESS_SIGN_OPTIONS);
        req.user = decoded;
        next();
    } catch (error) {
        throw new AccessDeniedError(error.message);
    }
}