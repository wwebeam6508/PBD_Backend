import admin from 'firebase-admin'
import { BadRequestError, NotFoundError } from '../../utils/api-errors.js'
import { generateJWT, verifyRefreshJWT } from './jwt.service.js'
import bcrypt from 'bcrypt'
import env
from '../../../env_config.json' assert { type: "json" };
const signIn = async ({
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
        console.log(err)
        throw new BadRequestError(err.message);
    })
}

const refresh = async ({
    token
}) => {
    try {
        const data = await verifyRefreshJWT({token:token})
        const refreshToken = await generateJWT({
            payload:data.data,secretKey:env.JWT_REFRESH_TOKEN_SECRET
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
    signIn,
    refresh,
    updateRefreshToken
}