import { updateAllowUserTypeDB } from "../../services/menu/menu.service.js";

async function updateRuleController(httpRequest) {
    const body = httpRequest.body
    await updateAllowUserTypeDB(body)
    return {
        statusCode: 200,
        body:{
            messasge:"success"
        }
    }
}

export {
    updateRuleController as updateRule
}