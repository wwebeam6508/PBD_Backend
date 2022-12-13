import admin from 'firebase-admin'

export const loadCheckLimitData = async ()  =>{
    const db = admin.firestore()
    const data = (await db.doc(`limit_invoke/detail`).get()).data()
    return data
}

export const updateLimitData = async (count, date) =>{
    const db = admin.firestore()
    const ref = db.doc(`limit_invoke/detail`)
    const dataUpdate = {
        count: count,
        date : date
    }
    await ref.update(dataUpdate)
}