import { verifyJWT } from "../../services/auth/jwt.service.js";
import {
  addUserTypeData,
  deleteUserTypeData,
  getAllUserTypeCount,
  getUserTypeByIDData,
  getUserTypeData,
  updateUserTypeData,
} from "../../services/userTypeManagement/userTypeManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getUserType(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const search = query.search ? query.search : "";
  const searchFilter = query.searchFilter ? query.searchFilter : "";
  const searchPipeline = [
    {
      $match:
        searchFilter === "date"
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
  const allWorksCount = await getAllUserTypeCount(search, searchPipeline);
  const pages = pageArray(allWorksCount, pageSize, query.page, 5);
  const userDoc = (
    await getUserTypeData({
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

async function getUserTypeByID(httpRequest) {
  const query = httpRequest.query;
  let data = await getUserTypeByIDData(query.userTypeID);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function addUserType(httpRequest) {
  const body = httpRequest.body;
  const data = await addUserTypeData(body);
  return {
    statusCode: 200,
    body: {
      data: data,
      message: "success",
    },
  };
}

async function updateUserType(httpRequest) {
  const body = httpRequest.body;
  const userData = await verifyJWT({
    token: httpRequest.headers.Authorization.split(" ")[1],
  });
  const data = await updateUserTypeData({
    ...body,
    selfUserTypeID: userData.data.userType.userTypeID,
  });
  return {
    statusCode: 200,
    body: {
      data: data,
      message: "success",
    },
  };
}

async function deleteUserType(httpRequest) {
  const query = httpRequest.query;

  const userData = await verifyJWT({
    token: httpRequest.headers.Authorization.split(" ")[1],
  });
  await deleteUserTypeData({
    userTypeID: query.userTypeID,
    selfUserTypeID: userData.data.userType.userTypeID,
  });
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

export {
  addUserType,
  getUserType,
  getUserTypeByID,
  updateUserType,
  deleteUserType,
};
