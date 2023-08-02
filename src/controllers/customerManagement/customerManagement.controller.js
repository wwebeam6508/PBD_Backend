import {
  addCustomer,
  deleteCustomer,
  getCustomerByID,
  getCustomers,
  getCustomersCount,
  updateCustomer,
} from "../../services/customerManagement/customerManagement.service.js";
import { pageArray } from "../../utils/helper.util.js";

async function getCustomersPaginationController(httpRequest) {
  const query = httpRequest.query;
  const pageSize = query.pageSize ? Number(query.pageSize) : 10;
  const sortTitle = query.sortTitle;
  const sortType = query.sortType;
  const allCostomerCount = await getCustomersCount();
  const pages = pageArray(allCostomerCount, pageSize, query.page, 5);
  const customerDoc = (
    await getCustomers({
      page: query.page,
      pageSize: pageSize,
      sortTitle: sortTitle,
      sortType: sortType,
    })
  ).map((res) => {
    let passData = {
      name: res.name,
      address: res.address,
      taxID: res.taxID,
      customerID: res.customerID,
    };
    return passData;
  });
  return {
    statusCode: 200,
    body: {
      currentPage: query.page,
      pages: pages,
      data: customerDoc,
      lastPage: Math.ceil(allCostomerCount / pageSize),
    },
  };
}

async function getCustomerByIDController(httpRequest) {
  const query = httpRequest.query;
  let customerDoc = await getCustomerByID({
    customerID: query.customerID,
  });
  return {
    statusCode: 200,
    body: {
      data: customerDoc,
    },
  };
}

async function addCustomerController(httpRequest) {
  const body = httpRequest.body;
  await addCustomer(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function updateCustomerController(httpRequest) {
  const body = httpRequest.body;
  await updateCustomer(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

async function deleteCustomerController(httpRequest) {
  const body = httpRequest.body;
  await deleteCustomer(body);
  return {
    statusCode: 200,
    body: {
      message: "success",
    },
  };
}

export {
  getCustomersPaginationController as getCustomersPagination,
  getCustomerByIDController as getCustomerByID,
  addCustomerController as addCustomer,
  updateCustomerController as updateCustomer,
  deleteCustomerController as deleteCustomer,
};
