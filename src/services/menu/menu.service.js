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
    return snapshot.docs.map(async (res) => {
        const snapshotSubMenu = await db.collection('menu').doc(res.id).collection('subMenu').get()
        if (snapshotSubMenu.docs.length > 0) {
            res.data().subMenu = await snapshotSubMenu.docs.map((subMenu) => {
                return subMenu.data()
            })
        }
        return res.data()
    })
}

export {
    getMenuDB,
    updateAllowUserTypeDB
}