import { getAllWorksCount, getWorks } from "../../services/projectManagement/projectManagement.service.js";

async function getWorkPagination(httpRequest) {
    const params = httpRequest.params
    const pageSize = 5
    const pages = pageArray(await getAllWorksCount(), pageSize, params.page)
    const workDoc = await getWorks({page:params.page,pageSize:pageSize})

    return {
        statusCode: 200,
        body:{
            pages:pages,
            data:workDoc
        }
    }
}

function pageArray(totalSize,pageSize,page) {
    const currentPage = Number(page)
    const max_length = 5
    const current_position = Math.floor(max_length/2)
    const totalPage = Math.ceil(totalSize/pageSize)

    const startPoint = currentPage - current_position >= 1 ? currentPage - current_position : 1
    const endPoint = currentPage + current_position <= totalPage ? currentPage + current_position : totalPage
    let pages = []
    if(startPoint !== 1){
        pages.push("...")
    }
    for (let i = startPoint; i <= endPoint; i++) {
        pages.push(i)
    }
    if(endPoint !== totalPage){
        pages.push("...")
    }
    return pages
}

export {
    getWorkPagination
}