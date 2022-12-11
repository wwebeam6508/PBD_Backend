import admin from 'firebase-admin'
import { BadRequestError, NotFoundError } from '../../utils/api-errors.js'

const editAllowUserType = async ({
    containsUserTypeID,
    menuID
}) => {
    const db = admin.firestore()
    const menuRef = db.doc(`menu/${menuID}`)
    const menuResult = await menuRef.get()
    if(!menuResult.exists) throw NotFoundError("Not Found Menu")

    const addValues = containsUserTypeID.filter((val)=>{
        if(menuResult.data().allowUserType.indexOf(val) === -1){
            return true
        }
        return false
    })
    await menuRef.update({containsUserTypeID: addValues}).catch((err)=>{
        throw new BadRequestError(err.message);
    })
}

export {
    editAllowUserType
}