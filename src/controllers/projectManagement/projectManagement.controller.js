import {
  addWork,
  deleteWork,
  getAllWorksCount,
  getWorks,
} from "../../services/projectManagement/projectManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getWorkPaginationController(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const allWorksCount = await getAllWorksCount();
  const pages = pageArray(allWorksCount, pageSize, query.page, 5);
  const workDoc = await Promise.all(
    (
      await getWorks({
        page: query.page,
        pageSize: pageSize,
        sortTitle: sortTitle,
        sortType: sortType,
      })
    ).map(async (res) => {
      return {
        title: res.title,
        contractor: (await res.customer.get()).data().name,
        date: new Date(res.date._seconds * 1000),
      };
    })
  );
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

async function addWorkController(httpRequest) {
  const body = httpRequest.body;
  await addWork(body);
  return {
    statusCode: 200,
    body: {
      messasge: "success",
    },
  };
}

async function deleteWorkController(httpRequest) {
  const body = httpRequest.body;
  await deleteWork(body);
  return {
    statusCode: 200,
    body: {
      messasge: "success",
    },
  };
}

async function updateWorkController(httpRequest) {
  const body = httpRequest.body;
  await updateWork(body);
  return {
    statusCode: 200,
    body: {
      messasge: "success",
    },
  };
}

export {
  updateWorkController as updateWork,
  addWorkController as addWork,
  getWorkPaginationController as getWorkPagination,
  deleteWorkController as deleteWork,
};
