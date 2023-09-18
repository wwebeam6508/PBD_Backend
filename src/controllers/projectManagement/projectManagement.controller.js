import {
  addWork,
  deleteWork,
  getAllWorksCount,
  getCustomerName,
  getWorks,
  getWorksByID,
  updateWork,
} from "../../services/projectManagement/projectManagement.service.js";
import { isEmpty, pageArray } from "../../utils/helper.util.js";
import caching from "../../utils/caching.js";

async function getWorkPaginationController(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const search = query.search ? query.search : "";
  const searchFilter = query.searchFilter ? query.searchFilter : "";
  const searchPipeline = [
    {
      $lookup: {
        from: "customers",
        localField: "customer.$id",
        foreignField: "_id",
        as: "customers",
      },
    },
    {
      $match:
        searchFilter === "customer"
          ? { "customers.name": { $regex: search, $options: "i" } }
          : searchFilter === "profit"
          ? {
              profit: {
                $gte: Number(search.split(",")[0]),
                $lte: Number(search.split(",")[1]),
              },
            }
          : searchFilter === "date" || searchFilter === "dateEnd"
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
  const allWorksCount = await getAllWorksCount(search, searchPipeline);
  const pages = pageArray(allWorksCount, pageSize, query.page, 5);
  const workDoc = (
    await getWorks({
      page: query.page,
      pageSize: pageSize,
      sortTitle: sortTitle,
      sortType: sortType,
      search: search,
      searchPipeline: searchPipeline,
    })
  ).map((res) => {
    let passData = {
      title: res.title,
      date: res.date,
      profit: res.profit ? res.profit : 0,
      projectID: res.projectID,
      customer: res.customer,
    };
    if (res.dateEnd) {
      passData.dateEnd = res.dateEnd ? res.dateEnd : null;
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
  const res = await addWork(body);
  const cacheKeys = {
    spentAndEarnEachMonth: `spentAndEarnEachMonth-${res.year}`,
    yearsReport: `yearsReport`,
    totalEarn: "totalEarn",
    ratioWorkCustomer: `ratioTotalWorkAndCustomer`,
    totalWorks: `totalWorks`,
  };
  //reset cache
  for (const key in cacheKeys) {
    caching.resetCache(cacheKeys[key]);
  }
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function deleteWorkController(httpRequest) {
  const body = httpRequest.body;
  const res = await deleteWork(body);
  const cacheKeys = {
    spentAndEarnEachMonth: `spentAndEarnEachMonth-${res.year}`,
    yearsReport: `yearsReport`,
    totalEarn: "totalEarn",
    ratioWorkCustomer: `ratioTotalWorkAndCustomer`,
    totalWorks: `totalWorks`,
  };
  //reset cache
  for (const key in cacheKeys) {
    caching.resetCache(cacheKeys[key]);
  }
  if (res.status) {
    return {
      statusCode: 200,
      body: {
        message: "success",
      },
    };
  } else {
    return {
      statusCode: 200,
      body: {
        message: res.message,
      },
    };
  }
}

async function updateWorkController(httpRequest) {
  const body = httpRequest.body;
  const res = await updateWork(body);
  const cacheKeys = {
    spentAndEarnEachMonth: `spentAndEarnEachMonth-${res.year}`,
    yearsReport: `yearsReport`,
    totalEarn: "totalEarn",
    ratioWorkCustomer: `ratioTotalWorkAndCustomer`,
    totalWorks: `totalWorks`,
  };
  //reset cache
  for (const key in cacheKeys) {
    caching.resetCache(cacheKeys[key]);
  }
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
