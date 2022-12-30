
import { refreshTokenDB, loginDB, updateRefreshToken } from "../../services/auth/auth.service.js";
/**
   * Handle logging in user.
   * @async
   * @method
   * @param {ExpressRequest} httpRequest
   */
async function loginController(httpRequest) {
    const body = httpRequest.body
    const data = await loginDB({username:body.username, password:body.password})
    await updateRefreshToken({token:data.refreshToken,userID:data.userProfile.userID})
    return {
        statusCode: 200,
        body: {
            data: {
                accessToken:data.accessToken,
                userProfile:data.userProfile,
                refreshToken:data.refreshToken
            }
        }
    }
}

async function refreshTokenController(httpRequest){
    const body = httpRequest.body
    const data = await refreshTokenDB({token:body.refreshToken.split(' ')[1]})
    await updateRefreshToken({token:data.refreshToken,userID:data.userID})
    return {
        statusCode: 200,
        body: {
            data: {
                accessToken:data.accessToken,
                refreshToken:data.refreshToken
            }
        }
    }
}

export {
    loginController as login,
    refreshTokenController as refreshToken
}
