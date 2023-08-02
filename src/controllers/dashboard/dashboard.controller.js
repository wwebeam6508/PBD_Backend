import { getSpentAndEarnEachMonth } from "../../services/dashboard/dashboard.service.js";

async function getEarnAndSpendEachYearController(httpRequest) {
  const query = httpRequest.query;
  const year = query.year ? query.year : new Date().getFullYear();
  let data = await getSpentAndEarnEachMonth(year);
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

export { getEarnAndSpendEachYearController as getEarnAndSpendEachYear };
