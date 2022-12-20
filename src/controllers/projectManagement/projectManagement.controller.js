import { addWork, deleteWork, getAllWorksCount, getWorks } from "../../services/projectManagement/projectManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getWorkPaginationController(httpRequest) {
    const params = httpRequest.params
    const pageSize = 5
    const pages = pageArray(await getAllWorksCount(), pageSize, params.page, 5)
    const workDoc = await (await getWorks({page:params.page,pageSize:pageSize}))
    .map((res)=>{
        return {
            title:res.title,
            contractor:res.contractor,
            date: new Date(res.date._seconds * 1000)
        }
    })

    return {
        statusCode: 200,
        body:{
            currentPage: params.page,
            pages:pages,
            data:workDoc
        }
    }
}

async function addWorkController(httpRequest) {
    const body = httpRequest.body
    await addWork(body)
    return {
        statusCode: 200,
        body:{
            messasge:"success"
        }
    }
}

async function deleteWorkController(httpRequest){
    const body = httpRequest.body
    await deleteWork(body)
    return {
        statusCode: 200,
        body:{
            messasge:"success"
        }
    }
}

export {
    addWorkController as addWork,
    getWorkPaginationController as getWorkPagination,
    deleteWorkController as deleteWork
}