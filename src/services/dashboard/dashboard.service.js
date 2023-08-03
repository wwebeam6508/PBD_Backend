import { BadRequestError } from "../../utils/api-errors.js";
import admin from "firebase-admin";

// get spent and earn each month in current extract as { month , earn , spend}
const getSpentAndEarnEachMonth = async (year) => {
  try {
    const db = admin.firestore();
    // find year in firestore timestamp
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 32);
    const startTimestamp = admin.firestore.Timestamp.fromDate(start);
    const endTimestamp = admin.firestore.Timestamp.fromDate(end);
    // get all expense in year
    const expensesDoc = await db
      .collection("expenses")
      .where("date", ">=", startTimestamp)
      .where("date", "<=", endTimestamp)
      .get();
    // get all income in year
    const incomeDoc = await db
      .collection("works")
      .where("date", ">=", startTimestamp)
      .where("date", "<=", endTimestamp)
      .get();
    // make array of month

    const month = [];
    for (let i = 0; i < 12; i++) {
      month.push({
        month: i + 1,
        earn: 0,
        spendWithVat: 0,
        spendWithOutVat: 0,
      });
    }
    // add expense to month
    expensesDoc.forEach((res) => {
      const monthIndex = new Date(res.data().date._seconds * 1000).getMonth();
      // find totalPrice in lists
      let totalPrice = 0;
      res.data().lists.forEach((list) => {
        totalPrice += list.price;
      });
      res.data().currentVat > 0
        ? (month[monthIndex].spendWithVat += totalPrice)
        : (month[monthIndex].spendWithOutVat += totalPrice);
    });
    // add income to month
    incomeDoc.forEach((res) => {
      const monthIndex = new Date(res.data().date._seconds * 1000).getMonth();
      month[monthIndex].earn += res.data().profit;
    });
    return {
      month: month,
      years: await getYearsList(),
    };
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

//get total earn from works in whole works
const getTotalEarn = async (year) => {
  try {
    const db = admin.firestore();
    // find year in firestore timestamp if year is not null if null get all works
    const start = year ? new Date(year, 0, 1) : null;
    const end = year ? new Date(year, 11, 32) : null;
    const startTimestamp = start
      ? admin.firestore.Timestamp.fromDate(start)
      : null;
    const endTimestamp = end ? admin.firestore.Timestamp.fromDate(end) : null;
    // get all works in year
    const worksDoc = year
      ? await db
          .collection("works")
          .where("date", ">=", startTimestamp)
          .where("date", "<=", endTimestamp)
          .get()
      : await db.collection("works").get();
    // calculate total earn
    let totalEarn = 0;
    worksDoc.forEach((res) => {
      totalEarn += res.data().profit;
    });

    return totalEarn;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getTotalExpense = async (year) => {
  try {
    const db = admin.firestore();
    // find year in firestore timestamp if year is not null if null get all expenses
    const start = year ? new Date(year, 0, 1) : null;
    const end = year ? new Date(year, 11, 32) : null;
    const startTimestamp = start
      ? admin.firestore.Timestamp.fromDate(start)
      : null;
    const endTimestamp = end ? admin.firestore.Timestamp.fromDate(end) : null;
    // get all expenses in year
    const expensesDoc = year
      ? await db
          .collection("expenses")
          .where("date", ">=", startTimestamp)
          .where("date", "<=", endTimestamp)
          .get()
      : await db.collection("expenses").get();
    // calculate total expense
    let totalExpense = 0;
    expensesDoc.forEach((res) => {
      // find totalPrice in lists
      let totalPrice = 0;
      res.data().lists.forEach((list) => {
        totalPrice += list.price;
      });
      totalExpense += totalPrice;
    });

    return totalExpense;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getYearsReport = async () => {
  try {
    const db = admin.firestore();
    const worksDoc = await db.collection("works").get();
    const expensesDoc = await db.collection("expenses").get();
    const years = [];
    worksDoc.forEach((res) => {
      const year = new Date(res.data().date._seconds * 1000).getFullYear();
      if (!years.includes(year)) {
        years.push(year);
      }
    });
    expensesDoc.forEach((res) => {
      const year = new Date(res.data().date._seconds * 1000).getFullYear();
      if (!years.includes(year)) {
        years.push(year);
      }
    });
    //sort year asc
    years.sort((a, b) => a - b);
    // get profit and expense in each year
    const yearsReport = [];
    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      const totalEarn = await getTotalEarn(year);
      const totalExpense = await getTotalExpense(year);
      yearsReport.push({
        year: String(year),
        totalEarn: totalEarn,
        totalExpense: totalExpense,
      });
    }
    return yearsReport;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// years list in works or expenses
const getYearsList = async () => {
  try {
    const db = admin.firestore();
    const worksDoc = await db.collection("works").get();
    const expensesDoc = await db.collection("expenses").get();
    const years = [];
    worksDoc.forEach((res) => {
      const year = new Date(res.data().date._seconds * 1000).getFullYear();
      if (!years.includes(year)) {
        years.push(year);
      }
    });
    expensesDoc.forEach((res) => {
      const year = new Date(res.data().date._seconds * 1000).getFullYear();
      if (!years.includes(year)) {
        years.push(year);
      }
    });
    //sort year desc
    years.sort((a, b) => b - a);

    return years;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  getSpentAndEarnEachMonth,
  getTotalEarn,
  getTotalExpense,
  getYearsReport,
};
