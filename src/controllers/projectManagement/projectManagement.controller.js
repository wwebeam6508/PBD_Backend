import { getAllWorksCount, getWorks } from "../../services/projectManagement/projectManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getWorkPagination(httpRequest) {
    const params = httpRequest.params
    const pageSize = 5
    const pages = pageArray(await getAllWorksCount(), pageSize, params.page, 5)
    const workDoc = await getWorks({page:params.page,pageSize:pageSize})

    return {
        statusCode: 200,
        body:{
            currentPage: params.page,
            pages:pages,
            data:workDoc
        }
    }
}

export {
    getWorkPagination
}