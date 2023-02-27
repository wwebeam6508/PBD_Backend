import { addUserData, deleteUserData, getAllUserCount, getUserByIDData, getUserData, getUserTypeByIDData, getUserTypeData, updateUserData } from "../../services/userManagement/userManagement.service.js"
import { pageArray } from "../../utils/helper.util.js"


async function getUser(httpRequest) {
  const params = httpRequest.params
  const query = httpRequest.query
  const pageSize = query.pageSize ? Number(query.pageSize) : 15
  const AllUserCount = await getAllUserCount()
  const pages = pageArray(AllUserCount, pageSize, params.page, 5)
  const data = await getUserData({ page: params.page, pageSize: pageSize })
  return {
    statusCode: 200,
    body: {
      currentPage: params.page,
      pages: pages,
      data: data,
      lastPage: Math.ceil(AllUserCount / pageSize)
    }
  }
}

async function getUserByID(httpRequest) {
  const params = httpRequest.params
  let data = await getUserByIDData(params.id)
  return {
    statusCode: 200,
    body: {
      data: data
    }
  }
}

async function getUserType() {
  let data = await getUserTypeData()
  return {
    statusCode: 200,
    body: {
      data: data
    }
  }
}


async function getUserTypeByID(httpRequest) {
  const params = httpRequest.params
  let data = await getUserTypeByIDData(params.id)
  return {
    statusCode: 200,
    body: {
      data: data
    }
  }
}

async function addUser(httpRequest) {
  const body = httpRequest.body
  const data = await addUserData(body)
  return {
    statusCode: 200,
    body: {
      data: data,
      messasge: "success"
    }
  }
}

async function updateUser(httpRequest) {
  const body = httpRequest.body
  const params = httpRequest.params
  const data = await updateUserData(body, params.id)
  return {
    statusCode: 200,
    body: {
      data: data,
      messasge: "success"
    }
  }
}

async function deleteUser(httpRequest) {
  const params = httpRequest.params
  await deleteUserData(params.id, httpRequest.user.key)
  return {
    statusCode: 200,
    body: {
      messasge: "success"
    }
  }
}
export {
  addUser,
  getUser,
  getUserByID,
  getUserType,
  getUserTypeByID,
  updateUser,
  deleteUser
}