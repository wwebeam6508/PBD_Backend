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
    try {
        let data = conditionEmptyฺBody(body)
        const imageDataKey = ['background', 'background2']
        for (const key of imageDataKey) {
            if (data[key]) {
                data[key] = (await uploadFiletoStorage(data[key], 'home', key))
            }
        }
        const db = admin.firestore()
        await db.doc('home/detail').update(data).catch((error) => {
            throw new BadRequestError(error.message);
        })
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}



export {
    getHomeDetailData,
    updateHomeDetailData
}