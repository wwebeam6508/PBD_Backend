import admin from 'firebase-admin'
import { BadRequestError, NotFoundError } from '../../utils/api-errors.js'

const updateAllowUserTypeDB = async ({
    containsUserTypeID,
    menuID
}) => {
    const db = admin.firestore()
    const menuRef = db.doc(`menu/${menuID}`)
    const menuResult = await menuRef.get()
    if(!menuResult.exists) throw new NotFoundError(`Not Found ${menuID} Menu`)
    await menuRef.update({allowUserType:containsUserTypeID}).catch((err)=>{
        throw new BadRequestError(err.message);
    })
}

export {
    updateAllowUserTypeDB
}