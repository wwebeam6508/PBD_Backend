import {
  getSpentAndEarnEachMonth,
  getTotalEarn,
  getTotalExpense,
  getYearsReport,
} from "../../services/dashboard/dashboard.service.js";

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

export {
  getEarnAndSpendEachYearController as getEarnAndSpendEachYear,
  getTotalEarnController as getTotalEarn,
  getTotalExpenseController as getTotalExpense,
  getYearsReportController as getYearsReport,
};
