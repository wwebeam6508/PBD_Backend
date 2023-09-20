import {
  addUserData,
  deleteUserData,
  getAllUserCount,
  getUserByIDData,
  getUserData,
  getUserTypeByIDData,
  getUserTypeData,
  updateUserData,
} from "../../services/userManagement/userManagement.service.js";
import { isEmpty, pageArray } from "../../utils/helper.util.js";

async function getUser(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const search = query.search ? query.search : "";
  const searchFilter = query.searchFilter ? query.searchFilter : "";
  const searchPipeline = [
    {
      $lookup: {
        from: "userType",
        localField: "userTypeID.$id",
        foreignField: "_id",
        as: "userTypes",
      },
    },
    {
      $match:
        searchFilter === "userType"
          ? { "userTypes.name": { $regex: search, $options: "i" } }
          : searchFilter === "date"
          ? {
              [searchFilter]: {
                $gte: new Date(search.split(",")[0]),
                $lte: new Date(
                  !isEmpty(search.split(",")[1])
                    ? search.split(",")[1]
                    : new Date()
                ),
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
  const params = httpRequest.params;
  let data = await getUserByIDData(params.id);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function getUserType() {
  let data = await getUserTypeData();
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function getUserTypeByID(httpRequest) {
  const params = httpRequest.params;
  let data = await getUserTypeByIDData(params.id);
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
  const params = httpRequest.params;
  const data = await updateUserData(body, params.id);
  return {
    statusCode: 200,
    body: {
      data: data,
      message: "success",
    },
  };
}

async function deleteUser(httpRequest) {
  const params = httpRequest.params;
  await deleteUserData(params.id, httpRequest.user.key);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}
export {
  addUser,
  getUser,
  getUserByID,
  getUserType,
  getUserTypeByID,
  updateUser,
  deleteUser,
};
