import { addWork, deleteWork, getAllWorksCount, getWorks } from "../../services/projectManagement/projectManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getWorkPaginationController(httpRequest) {
    const params = httpRequest.params
    const query = httpRequest.query
    const pageSize = query.pageSize ? Number(query.pageSize) : 15
    const allWorksCount = await getAllWorksCount()
    const pages = pageArray(allWorksCount, pageSize, params.page, 5)
    const workDoc = await (await getWorks({ page: params.page, pageSize: pageSize }))
        .map((res) => {
            return {
                title: res.title,
                contractor: res.contractor,
                date: new Date(res.date._seconds * 1000)
            }
        })

    return {
        statusCode: 200,
        body: {
            currentPage: params.page,
            pages: pages,
            data: workDoc,
            lastPage: Math.ceil(allWorksCount / pageSize)
        }
    }
}

async function addWorkController(httpRequest) {
    const body = httpRequest.body
    await addWork(body)
    return {
        statusCode: 200,
        body: {
            messasge: "success"
        }
    }
}

async function deleteWorkController(httpRequest) {
    const body = httpRequest.body
    await deleteWork(body)
    return {
        statusCode: 200,
        body: {
            messasge: "success"
        }
    }
}

async function updateWorkController(httpRequest) {
    const body = httpRequest.body
    await updateWork(body)
    return {
        statusCode: 200,
        body: {
            messasge: "success"
        }
    }
}

export {
    updateWorkController as updateWork,
    addWorkController as addWork,
    getWorkPaginationController as getWorkPagination,
    deleteWorkController as deleteWork
}