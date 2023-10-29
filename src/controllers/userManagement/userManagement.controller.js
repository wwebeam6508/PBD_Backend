import {
  addUserData,
  deleteUserData,
  getAllUserCount,
  getUserByIDData,
  getUserData,
  getUserType,
  updateUserData,
} from "../../services/userManagement/userManagement.service.js";
import caching from "../../utils/caching.js";
import { verifyJWT } from "../../services/auth/jwt.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getUser(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const search = query.search ? query.search : "";
  const searchFilter = query.searchFilter ? query.searchFilter : "";
  const searchPipeline = [
    {
      $match:
        searchFilter === "userType"
          ? { "userType.name": { $regex: search, $options: "i" } }
          : searchFilter === "date"
          ? // if first array not empty and second array value is "" then only greater than and both have value then between
            search.split(",")[1] === ""
            ? {
                createdAt: {
                  $gte: new Date(search.split(",")[0]),
                },
              }
            : {
                createdAt: {
                  $gte: new Date(search.split(",")[0]),
                  $lte: new Date(search.split(",")[1]),
                },
              }
          : { [searchFilter]: { $regex: search, $options: "i" } },
    },
  ];
  const allWorksCount = await getAllUserCount(search, searchPipeline);
  const pages = pageArray(allWorksCount, pageSize, query.page, 5);
  const userDoc = (
    await getUserData({
      page: query.page,
      pageSize: pageSize,
      sortTitle: sortTitle,
      sortType: sortType,
      search: search,
      searchPipeline: searchPipeline,
    })
  ).map((res) => {
    return res;
  });
  return {
    statusCode: 200,
    body: {
      currentPage: query.page,
      pages: pages,
      data: userDoc,
      lastPage: Math.ceil(allWorksCount / pageSize),
    },
  };
}

async function getUserByID(httpRequest) {
  const query = httpRequest.query;
  let data = await getUserByIDData(query.userID);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function addUser(httpRequest) {
  const body = httpRequest.body;
  const data = await addUserData(body);
  return {
    statusCode: 200,
    body: {
      data: data,
      message: "success",
    },
  };
}

async function updateUser(httpRequest) {
  const body = httpRequest.body;

  const userData = await verifyJWT({
    token: httpRequest.headers.Authorization.split(" ")[1],
  });
  await updateUserData(body, userData.data.userID);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function deleteUser(httpRequest) {
  const query = httpRequest.query;
  const userData = await verifyJWT({
    token: httpRequest.headers.Authorization.split(" ")[1],
  });
  await deleteUserData(query.userID, userData.data.userID);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function getUserTypeNameController() {
  const cacheKey = "userTypeName";
  const cacheData = caching.getFromCache(cacheKey);
  const customerName = cacheData ? cacheData : await getUserType();
  if (!cacheData) {
    caching.setCache(cacheKey, customerName, 60 * 10);
  }
  return {
    statusCode: 200,
    body: {
      data: customerName,
    },
  };
}
export {
  addUser,
  getUser,
  getUserByID,
  updateUser,
  deleteUser,
  getUserTypeNameController as getUserTypeName,
};
