import {
  getSpentAndEarnEachMonth,
  getTotalEarn,
  getTotalExpense,
  getTotalWork,
  getTotalWorkUnfinished,
  getWorkCustomer,
  getYearsReport,
} from "../../services/dashboard/dashboard.service.js";

async function getDashboardController() {
  //get each function
  const workCustomer = await getWorkCustomer();

  const data = {
    spentAndEarnEachMonth: await getSpentAndEarnEachMonth(
      new Date().getFullYear()
    ),
    yearsReport: await getYearsReport(),
    totalEarn: await getTotalEarn(),
    totalExpense: await getTotalExpense(),
    totalWork: await getTotalWork(),
    totalWorkUnfinished: await getTotalWorkUnfinished(),
    customerWorkRatio: workCustomer.customers,
    customerProfitRatio: workCustomer.customerMoney,
  };
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
