import admin from 'firebase-admin'
import { BadRequestError, NotFoundError } from '../../utils/api-errors.js'

const updateAllowUserTypeDB = async ({
    containsUserTypeID,
    menuID
}) => {
    const db = admin.firestore()
    const menuRef = db.doc(`menu/${menuID}`)
    const menuResult = await menuRef.get()
    if (!menuResult.exists) throw new NotFoundError(`Not Found ${menuID} Menu`)
    await menuRef.update({ allowUserType: containsUserTypeID }).catch((err) => {
        throw new BadRequestError(err.message);
    })
}

const getMenuDB = async () => {
    const db = admin.firestore()
    const snapshot = await db.collection('menu').get()
    let returnData = snapshot.docs.map((res) => {
        return {
            ...res.data(),
            key: res.id
        }
    }) 
    for (let i = 0; i < returnData.length; i++) {
        const subMenu = await getSubMenuDB(returnData[i].key)
        returnData[i].subMenu = subMenu
    }
    return returnData
}

const getSubMenuDB = async (menuID) => {
    const db = admin.firestore()
    const snapshot = await db.collection('menu').doc(menuID).collection('subMenu').get()
    let returnData = snapshot.docs.map((res) => {
        return {
            ...res.data(),
            key: res.id
        }
    })
    return returnData
}

export {
    getMenuDB,
    updateAllowUserTypeDB
}