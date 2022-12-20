import admin from 'firebase-admin'
import { BadRequestError} from '../../utils/api-errors.js'

const getWorks = async ({
    page = 1,
    pageSize = 2
}) => {
    try {
        const offset = pageSize * (page - 1);
        const db = admin.firestore()
        const snapshot = await db.collection('works')
        .limit(pageSize).offset(offset).get()
        return snapshot.docs.map((res)=>{
            return res.data()
        })
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}

const addWork = async ({
    title,
    date = new Date(date),
    detail = "",
    profit = 0,
    images = []
}) => {
    const body = {
        title,
        date: admin.firestore.Timestamp.fromDate(date),
        detail,
        profit,
        images
    }
    const db = admin.firestore()
    await db.collection('works').add(body).catch((error)=>{
        throw new BadRequestError(error.message);
    })
}

const deleteWork = async ({
    workID 
}) => {
    const db = admin.firestore()
    await db.collection('works').doc(workID).delete().catch((error)=>{
        throw new BadRequestError(error.message);
    })
}

const getAllWorksCount = async () =>{
    try {
        const db = admin.firestore()
        const result = await db.collection('works').get()
        return result.size
    } catch (error) {
        throw new BadRequestError(error.message);
    }
}

export {
    deleteWork,
    addWork,
    getWorks,
    getAllWorksCount
}