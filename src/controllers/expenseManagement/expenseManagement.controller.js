import { pageArray } from "../../utils/helper.util.js";

async function getExpensesPaginationController(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle ? query.sortTitle : "date";
  const sortType = query.sortType ? query.sortType : "desc";
  const allExpensesCount = await getAllExpensesCount();
  const pages = pageArray(allExpensesCount, pageSize, query.page, 5);
  const expenseDoc = (
    await getExpenses({
      page: query.page,
      pageSize: pageSize,
      sortTitle: sortTitle,
      sortType: sortType,
    })
  ).map((res) => {
    let passData = {
      title: res.title,
      date: new Date(res.date._seconds * 1000),
      totalPrice: res.totalPrice ? res.totalPrice : 0,
      expenseID: res.expenseID,
      workRef: res.workRef,
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
    workID: query.workID,
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

export {
  getExpenseByIDController as getExpenseByID,
  updateExpenseController as updateExpense,
  addExpenseController as addExpense,
  getExpensesPaginationController as getExpensesPagination,
  deleteExpenseController as deleteExpense,
};
