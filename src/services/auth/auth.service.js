import admin from 'firebase-admin'
import { AccessDeniedError, BadRequestError, NotFoundError } from '../../utils/api-errors.js'
import { generateJWT, verifyRefreshJWT } from './jwt.service.js'
import bcrypt from 'bcrypt'
import env
from '../../../env_config.json' assert { type: "json" };
const loginDB = async ({
    username,
    password
}) => {

    const db = admin.firestore()
    const ref = db.collection('users')
    const query = await ref.where('username', '==', username).get()
    if(query.empty){
        throw new NotFoundError('user not found')
    }

    let data = {}
    query.forEach(doc => {
        data = doc.data()
        data.userID = doc.id
    })
    
    const isValidPass = bcrypt.compareSync(password, data.password);
    if (!isValidPass) {
      throw new BadRequestError('Username or Password is invalid!');
    }
    delete data.password
    delete data.refreshToken

    const accessToken = await generateJWT({payload:{data}})
    const refreshToken = await generateJWT({
        payload:{data},secretKey:env.JWT_REFRESH_TOKEN_SECRET
        ,signOption:env.JWT_REFRESH_SIGN_OPTIONS})
    return {
        accessToken:accessToken,
        refreshToken:refreshToken,
        userProfile:data
    }
}

const updateRefreshToken = async ({
    token,
    userID
}) => {
    const db = admin.firestore()
    const ref = db.doc(`users/${userID}`)
    await ref.update({refreshToken: token}).catch((err)=>{
        throw new BadRequestError(err.message);
    })
}

const checkRefreshToken = async ({
    token,
    userID
}) =>{
    const db = admin.firestore()
    const ref = db.doc(`users/${userID}`)
    const result = await ref.get()
    if(result.data().refreshToken.split(" ")[1] != token) return false
    return true
}

const refreshTokenDB = async ({
    token
}) => {
    try {
        const data = await verifyRefreshJWT({token:token})
        if(!await checkRefreshToken({token:token, userID:data.data.userID})) throw new AccessDeniedError("Access Denied");
        const refreshToken = await generateJWT({
            payload:{data:data.data},secretKey:env.JWT_REFRESH_TOKEN_SECRET
            ,signOption:env.JWT_REFRESH_SIGN_OPTIONS})
        const accessToken = await generateJWT({payload:data.data})
        return {
            refreshToken:refreshToken,
            accessToken:accessToken,
            userID:data.data.userID
        }
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}

export {
    loginDB,
    refreshTokenDB,
    updateRefreshToken
}