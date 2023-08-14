import {
  getSpentAndEarnEachMonth,
  getTotalEarn,
  getTotalExpense,
  getTotalWork,
  getTotalWorkUnfinished,
  getWorkCustomer,
  getYearsReport,
} from "../../services/dashboard/dashboard.service.js";
import caching from "../../utils/caching.js";

async function getDashboardController() {
  //get each function
  const currentYear = new Date().getFullYear();
  const cacheKeys = {
    spentAndEarnEachMonth: `spentAndEarnEachMonth-${currentYear}`,
    yearsReport: `yearsReport`,
    totalEarn: `totalEarn-`,
    totalExpense: `totalExpense-`,
    totalWork: `totalWork-`,
    totalWorkUnfinished: `totalWorkUnfinished-`,
    customerWork: `customerWork`,
  };

  //get data from cache
  const cacheData = {
    spentAndEarnEachMonth: caching.getFromCache(
      cacheKeys.spentAndEarnEachMonth
    ),
    yearsReport: caching.getFromCache(cacheKeys.yearsReport),
    totalEarn: caching.getFromCache(cacheKeys.totalEarn),
    totalExpense: caching.getFromCache(cacheKeys.totalExpense),
    totalWork: caching.getFromCache(cacheKeys.totalWork),
    totalWorkUnfinished: caching.getFromCache(cacheKeys.totalWorkUnfinished),
    workCustomer: caching.getFromCache(cacheKeys.customerWork),
  };
  console.log(cacheData);

  const workCustomer = cacheData.workCustomer
    ? cacheData.workCustomer
    : await getWorkCustomer();
  const data = {
    spentAndEarnEachMonth: cacheData.spentAndEarnEachMonth
      ? cacheData.spentAndEarnEachMonth
      : await getSpentAndEarnEachMonth(currentYear),
    yearsReport: cacheData.yearsReport
      ? cacheData.yearsReport
      : await getYearsReport(),
    totalEarn: cacheData.totalEarn ? cacheData.totalEarn : await getTotalEarn(),
    totalExpense: cacheData.totalExpense
      ? cacheData.totalExpense
      : await getTotalExpense(),
    totalWork: cacheData.totalWork ? cacheData.totalWork : await getTotalWork(),
    totalWorkUnfinished: cacheData.totalWorkUnfinished
      ? cacheData.totalWorkUnfinished
      : await getTotalWorkUnfinished(),
    customerWorkRatio: workCustomer.customers,
    customerProfitRatio: workCustomer.customerMoney,
  };

  //check if cache is empty then set cache by forloop key from cacheKeys
  for (const key in cacheData) {
    if (!cacheData[key]) {
      if (data[key] != (null || undefined)) {
        caching.setCache(cacheKeys[key], data[key], 60 * 60);
      }
    }
  }
  if (!cacheData.workCustomer) {
    caching.setCache(cacheKeys.customerWork, workCustomer);
  }

  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function getEarnAndSpendEachYearController(httpRequest) {
  const query = httpRequest.query;
  const year = query.year ? query.year : new Date().getFullYear();
  const data = await getSpentAndEarnEachMonth(year);
  return {
    statusCode: 200,
    body: {
      data: {
        ...data,
        activeYear: year,
      },
    },
  };
}

//get total earn
async function getTotalEarnController(httpRequest) {
  const query = httpRequest.query;
  const year = query.year ? query.year : null;
  const data = await getTotalEarn(year);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

//get total expense
async function getTotalExpenseController(httpRequest) {
  const query = httpRequest.query;
  const year = query.year ? query.year : null;
  const data = await getTotalExpense(year);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function getYearsReportController() {
  const data = await getYearsReport();
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function getTotalWorkController(httpRequest) {
  const query = httpRequest.query;
  const year = query.year ? query.year : null;
  const data = await getTotalWork(year);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

async function getTotalWorkUnfinishedController(httpRequest) {
  const query = httpRequest.query;
  const year = query.year ? query.year : null;
  const data = await getTotalWorkUnfinished(year);
  return {
    statusCode: 200,
    body: {
      data: data,
    },
  };
}

export {
  getEarnAndSpendEachYearController as getEarnAndSpendEachYear,
  getTotalEarnController as getTotalEarn,
  getTotalExpenseController as getTotalExpense,
  getYearsReportController as getYearsReport,
  getTotalWorkController as getTotalWork,
  getTotalWorkUnfinishedController as getTotalWorkUnfinished,
  getDashboardController as getDashboard,
};
