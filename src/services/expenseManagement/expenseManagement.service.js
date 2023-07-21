import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";

const getExpenses = async ({ page = 1, pageSize = 5, sortTitle, sortType }) => {
  try {
    const offset = pageSize * (page - 1);
    const db = admin.firestore();
    const snapshot = db.collection("expenses");
    const expenseQuery = snapshot.limit(pageSize).offset(offset);
    if (sortTitle && sortType) {
      expenseQuery.orderBy(sortTitle, sortType);
    }
    const total = await expenseQuery.get();
    const result = await Promise.all(
      total.docs.map(async (res) => {
        return {
          expenseID: res.id,
          ...res.data(),
          workRef: workRef ? (await res.data().workRef.get()).data().title : "",
        };
      })
    );
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getExpenseByID = async ({ expenseID }) => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("expenses").doc(expenseID);
    const expenseQuery = await snapshot.get();
    let result = {
      expenseID: expenseQuery.id,
      ...expenseQuery.data(),
      workRef: workRef ? (await res.data().workRef.get()).id : null,
    };
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addExpense = async ({
  title,
  date = new Date(date),
  totalPrice = 0,
  workRef,
  detail,
  lists = [],
  prices = [],
}) => {
  try {
    let passData = {
      title,
      date: admin.firestore.Timestamp.fromDate(date),
      totalPrice,
      workRef: workRef ? admin.firestore().doc(`works/${workRef}`) : null,
      detail,
      lists,
      prices,
    };
    const db = admin.firestore();
    const snapshot = db.collection("expenses");
    const expenseQuery = await snapshot.add(passData);
    return expenseQuery.id;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateExpense = async ({
  expenseID,
  title,
  date = new Date(date),
  totalPrice = 0,
  workRef,
  detail,
  addLists = [],
  addPrices = [],
  removeLists = [],
  removePrices = [],
}) => {
  try {
    let passData = {
      title,
      date: admin.firestore.Timestamp.fromDate(date),
      totalPrice,
      workRef: workRef ? admin.firestore().doc(`works/${workRef}`) : null,
      detail,
    };

    const db = admin.firestore();
    const snapshot = db.collection("expenses").doc(expenseID);
    const expenseQuery = await snapshot.update(passData);

    if (addLists.length > 0) {
      await snapshot.update({
        lists: admin.firestore.FieldValue.arrayUnion(...addLists),
      });
    }
    if (addPrices.length > 0) {
      await snapshot.update({
        prices: admin.firestore.FieldValue.arrayUnion(...addPrices),
      });
    }
    if (removeLists.length > 0) {
      await snapshot.update({
        lists: admin.firestore.FieldValue.arrayRemove(...removeLists),
      });
    }
    if (removePrices.length > 0) {
      await snapshot.update({
        prices: admin.firestore.FieldValue.arrayRemove(...removePrices),
      });
    }
    return expenseQuery.id;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const deleteExpense = async ({ expenseID }) => {
  try {
    // check if expense has any project in reference
    const db = admin.firestore();
    await db.collection("expenses").doc(expenseID).delete();
    return true;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getExpensesCount = async () => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("expenses");
    const expenseQuery = await snapshot.get();
    return expenseQuery.docs.length;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getWorksTitle = async () => {
  try {
    const db = admin.firestore();
    const result = await db.collection("works").get();
    return result.docs.map((res) => {
      return {
        id: res.id,
        title: res.data().title,
      };
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  getExpensesCount,
  getExpenses,
  getExpenseByID,
  addExpense,
  updateExpense,
  deleteExpense,
  getWorksTitle,
};
