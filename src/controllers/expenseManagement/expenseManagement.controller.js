import {
  addExpense,
  deleteExpense,
  getExpenseByID,
  getExpenses,
  getExpensesCount,
  getWorksTitle,
  updateExpense,
} from "../../services/expenseManagement/expenseManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getExpensesPaginationController(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const search = query.search ? query.search : "";
  const searchFilter = query.searchFilter ? query.searchFilter : "";
  const searchPipeline = [
    {
      $lookup: {
        from: "works",
        localField: "workRef.$id",
        foreignField: "_id",
        as: "works",
      },
    },
    {
      // sum all price in lists as listSum
      $addFields: {
        listSum: {
          $reduce: {
            input: "$lists",
            initialValue: 0,
            in: { $add: ["$$value", "$$this.price"] },
          },
        },
      },
    },
    {
      $match:
        searchFilter === "work"
          ? { "works.title": { $regex: search, $options: "i" } }
          : searchFilter === "expense"
          ? {
              listSum: {
                $gte: Number(search.split(",")[0]),
                $lte: Number(search.split(",")[1]),
              },
            }
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
  const allExpensesCount = await getExpensesCount(search, searchPipeline);
  const pages = pageArray(allExpensesCount, pageSize, query.page, 5);
  const expenseDoc = (
    await getExpenses({
      page: query.page,
      pageSize: pageSize,
      sortTitle: sortTitle,
      sortType: sortType,
      search: search,
      searchPipeline: searchPipeline,
    })
  ).map((res) => {
    const totalPrice = parseFloat(res.lists.reduce((a, b) => a + b.price, 0));
    let passData = {
      title: res.title,
      date: res.date,
      totalPrice: totalPrice ? totalPrice : 0,
      expenseID: res.expenseID,
      workRef: res.workRef,
      isVat: res.currentVat > 0 ? true : false,
    };
    return passData;
  });
  return {
    statusCode: 200,
    body: {
      currentPage: query.page,
      pages: pages,
      data: expenseDoc,
      lastPage: Math.ceil(allExpensesCount / pageSize),
    },
  };
}

async function getExpenseByIDController(httpRequest) {
  const query = httpRequest.query;
  let expenseDoc = await getExpenseByID({
    expenseID: query.expenseID,
  });
  return {
    statusCode: 200,
    body: {
      data: expenseDoc,
    },
  };
}

async function addExpenseController(httpRequest) {
  const body = httpRequest.body;
  await addExpense(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function deleteExpenseController(httpRequest) {
  const body = httpRequest.body;
  await deleteExpense(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function updateExpenseController(httpRequest) {
  const body = httpRequest.body;
  await updateExpense(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}
async function getProjectTitleController() {
  const customerName = await getWorksTitle();
  return {
    statusCode: 200,
    body: {
      data: customerName,
    },
  };
}
export {
  getExpenseByIDController as getExpenseByID,
  updateExpenseController as updateExpense,
  addExpenseController as addExpense,
  getExpensesPaginationController as getExpensesPagination,
  deleteExpenseController as deleteExpense,
  getProjectTitleController as getProjectTitle,
};
