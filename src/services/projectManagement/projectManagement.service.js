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
    getWorks,
    getAllWorksCount
}