import { updateAllowUserTypeDB } from "../../services/menu/menu.service.js";

async function update(httpRequest) {
    const body = httpRequest.body
    await updateAllowUserTypeDB({menuID:body.menuID, containsUserTypeID:body.containsUserTypeID})
    return {
        statusCode: 200,
        body:{
            messasge:"success"
        }
    }
}

export {
    update
}