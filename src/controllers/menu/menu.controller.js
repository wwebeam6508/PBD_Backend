import { editAllowUserType } from "../../services/menu/menu.service.js";

async function updateAllowUserType(httpRequest) {
    const body = httpRequest.body
    await editAllowUserType({menuID:body.menuID, containsUserTypeID:body.containsUserTypeID})
    return {
        statusCode: 200,
        body:{
            messasge:"success"
        }
    }
}

export {
    updateAllowUserType
}