import admin from 'firebase-admin'
import { BadRequestError } from '../../utils/api-errors.js'
import { checkIsAganistItSelf, checkIsGodAdmin, conditionEmptyฺBody, encryptPassword } from '../../utils/helper.util.js'

const getUserData = async ({
    page = 1,
    pageSize = 10
}) => {
    try {
        const offset = pageSize * (page - 1);
        const db = admin.firestore()
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc')
            .limit(pageSize).offset(offset).get()
        let data = snapshot.docs.map((doc) => {
            let newdata = doc.data()
            newdata.key = doc.id
            delete newdata.refreshToken
            delete newdata.password
            return {
                ...newdata,
                key: doc.id
            }
        })
        for (let i = 0; i < data.length; i++) {
            const userType = await getUserTypeByIDData(data[i].userTypeID)
            data[i] = {
                ...data[i],
                userType: {
                    name: userType.name
                }
            }
        }
        return data
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}


const getUserByIDData = async (key) => {
    try {
        const db = admin.firestore()
        const response = await db.doc(`users/${key}`).get()
        let data = response.data()
        data.key = response.id
        delete data.refreshToken
        delete data.password

        return data
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}


const getUserTypeByIDData = async (id) => {
    try {
        const db = admin.firestore()
        const response = await db.doc(`userType/${id}`).get()
        return response.data()

    } catch (error) {
        throw new BadRequestError(error.message);
    }
}

const getUserTypeData = async () => {
    try {
        const db = admin.firestore()
        const response = await db.collection('userType').get()
        let data = response.docs.map(doc => {
            let newdata = doc.data()
            newdata.key = doc.id
            return {
                ...newdata,
                key: doc.id
            }
        })
        return data

    } catch (error) {
        throw new BadRequestError(error.message);
    }
}

const addUserData = async (body) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = conditionEmptyฺBody(body)
            const db = admin.firestore()
            data.password = await encryptPassword(data.password)
            data.createdAt = admin.firestore.FieldValue.serverTimestamp()
            await db.collection(`users`).add(data).catch((error) => {
                throw new BadRequestError(error.message);
            })
            resolve(data)
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    })
}

const updateUserData = async (body, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = conditionEmptyฺBody(body)
            const db = admin.firestore()
            if (data.password) {
                data.password = await encryptPassword(data.password)
            }
            await db.doc(`users/${id}`).update(data).catch((error) => {
                throw new BadRequestError(error.message);
            })
            resolve(data)
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    })
}

const deleteUserData = async (id, itSelftID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (checkIsAganistItSelf(itSelftID, id)) {
                throw new BadRequestError("Can't delete yourself");
            }
            if (await checkIsGodAdmin(id)) {
                throw new BadRequestError("Can't delete God admin");
            }
            const db = admin.firestore()
            await db.doc(`users/${id}`).delete().catch((error) => {
                throw new BadRequestError(error.message);
            })
            resolve()
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    })
}

const getAllUserCount = async () => {
    try {
        const db = admin.firestore()
        const response = await db.collection('users').get()
        return response.size
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}



export {
    getAllUserCount,
    getUserData,
    getUserByIDData,
    getUserTypeData,
    getUserTypeByIDData,
    addUserData,
    updateUserData,
    deleteUserData
}