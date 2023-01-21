import admin from 'firebase-admin'
import { BadRequestError } from '../../utils/api-errors.js'
import { conditionEmptyฺBody, uploadFiletoStorage } from '../../utils/helper.util.js'

const getHomeDetailData = async () => {
    try {
        const db = admin.firestore()
        const response = await db.doc('home/detail').get()
        return response.data()
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}

const updateHomeDetailData = async (body) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = conditionEmptyฺBody(body)
            //check if data have nasted object and check if data have image
            data = await uploadStorage(data)
            const db = admin.firestore()
            await db.doc('home/detail').update(data).catch((error) => {
                throw new BadRequestError(error.message);
            })
            resolve(data)
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    })
}

const uploadStorage = async (data) => {
    let newData = data
    for (const key in newData) {
        if (typeof newData[key] === 'object') {
            newData[key] = await uploadStorage(newData[key])
        } else
            if (newData[key].includes('data:image')) {
                const image = newData[key]
                const path = 'home'
                const filename = key
                const url = await uploadFiletoStorage(image, path, filename)
                newData[key] = url
            }
    }
    return newData
}

export {
    getHomeDetailData,
    updateHomeDetailData
}