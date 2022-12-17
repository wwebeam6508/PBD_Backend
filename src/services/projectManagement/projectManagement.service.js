import admin from 'firebase-admin'
import { BadRequestError, NotFoundError } from '../../utils/api-errors.js'

const getWorks = async ({
    page = 1,
    pageSize = 2
}) => {
    const offset = pageSize * (page - 1);
    const db = admin.firestore()
    const snapshot = await db.collection('works')
    .limit(pageSize).offset(offset).get()
    
    return snapshot.docs.map((res)=>{
        return res.data()
    })

}

const getAllWorksCount = async () =>{
    const db = admin.firestore()
    const result = await db.collection('works').get()
    return result.size
}

export {
    getWorks,
    getAllWorksCount
}