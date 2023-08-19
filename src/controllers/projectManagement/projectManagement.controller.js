import {
  addWork,
  deleteWork,
  getAllWorksCount,
  getCustomerName,
  getWorks,
  getWorksByID,
  updateWork,
} from "../../services/projectManagement/projectManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";
import caching from "../../utils/caching.js";

async function getWorkPaginationController(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const allWorksCount = await getAllWorksCount();
  const pages = pageArray(allWorksCount, pageSize, query.page, 5);
  const workDoc = (
    await getWorks({
      page: query.page,
      pageSize: pageSize,
      sortTitle: sortTitle,
      sortType: sortType,
    })
  ).map((res) => {
    let passData = {
      title: res.title,
      date: new Date(res.date._seconds * 1000),
      profit: res.profit ? res.profit : 0,
      projectID: res.projectID,
      customer: res.customer,
    };
    if (res.dateEnd) {
      passData.dateEnd = new Date(res.dateEnd._seconds * 1000);
    }
    return passData;
  });
  return {
    statusCode: 200,
    body: {
      currentPage: query.page,
      pages: pages,
      data: workDoc,
      lastPage: Math.ceil(allWorksCount / pageSize),
    },
  };
}

async function getWorkByIDController(httpRequest) {
  const query = httpRequest.query;
  let workDoc = await getWorksByID({
    workID: query.workID,
  });
  return {
    statusCode: 200,
    body: {
      data: workDoc,
    },
  };
}

async function addWorkController(httpRequest) {
  const body = httpRequest.body;
  await addWork(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function deleteWorkController(httpRequest) {
  const body = httpRequest.body;
  await deleteWork(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function updateWorkController(httpRequest) {
  const body = httpRequest.body;
  await updateWork(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function getCustomerNameController() {
  const cacheKey = "customerName";
  const cacheData = caching.getFromCache(cacheKey);
  const customerName = cacheData ? cacheData : await getCustomerName();
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
  getWorkByIDController as getWorkByID,
  updateWorkController as updateWork,
  addWorkController as addWork,
  getWorkPaginationController as getWorkPagination,
  deleteWorkController as deleteWork,
  getCustomerNameController as getCustomerName,
};
