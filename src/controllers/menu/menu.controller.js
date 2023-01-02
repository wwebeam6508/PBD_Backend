import { updateAllowUserTypeDB } from "../../services/menu/menu.service.js";

async function updateRuleController(httpRequest) {
    const body = httpRequest.body
    await updateAllowUserTypeDB(body)
    return {
        statusCode: 200,
        body: {
            messasge: "success"
        }
    }
}

async function getMenuController(httpRequest) {
    const body = httpRequest.body
    const data = await getMenuDB(body)
    return {
        statusCode: 200,
        body: {
            data: data
        }
    }
}

export {
    getMenuController as getMenu,
    updateRuleController as updateRule
}