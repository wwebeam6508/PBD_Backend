import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";

const getExpenses = async ({ page = 1, pageSize = 5, sortTitle, sortType }) => {
  try {
    const offset = pageSize * (page - 1);
    const db = admin.firestore();
    const snapshot = db.collection("expenses");
    let expenseQuery = snapshot.limit(pageSize).offset(offset);
    if (sortTitle && sortType) {
      expenseQuery = expenseQuery.orderBy(sortTitle, sortType);
    }
    const total = await expenseQuery.get();
    const result = await Promise.all(
      total.docs.map(async (res) => {
        console.log();
        return {
          expenseID: res.id,
          ...res.data(),
          workRef: res.data().workRef
            ? typeof res.data().workRef === "string"
              ? ""
              : (await res.data().workRef.get()).data().title
            : "",
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
      workRef: expenseQuery.data().workRef
        ? typeof expenseQuery.data().workRef === "string"
          ? expenseQuery.data().workRef
          : (await expenseQuery.data().workRef.get()).id
        : "",
    };
    result.isWorkRef = typeof expenseQuery.data().workRef === "object";
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addExpense = async ({
  title,
  date = new Date(date),
  workRef,
  detail,
  lists = [],
  isWorkRef,
  currentVat,
}) => {
  try {
    let passData = {
      title,
      date: admin.firestore.Timestamp.fromDate(date),
      workRef: isWorkRef ? admin.firestore().doc(`works/${workRef}`) : "",
      detail,
      lists,
      currentVat,
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
  workRef,
  detail,
  addLists = [],
  removeLists = [],
  isWorkRef,
  currentVat = 0,
}) => {
  try {
    let passData = {
      title,
      date: admin.firestore.Timestamp.fromDate(date),
      workRef: isWorkRef ? admin.firestore().doc(`works/${workRef}`) : "",
      detail,
      currentVat,
    };

    const db = admin.firestore();
    const snapshot = db.collection("expenses").doc(expenseID);
    const expenseQuery = await snapshot.update(passData);

    if (addLists.length > 0) {
      await snapshot.update({
        lists: admin.firestore.FieldValue.arrayUnion(...addLists),
      });
    }
    if (removeLists.length > 0) {
      await snapshot.update({
        lists: admin.firestore.FieldValue.arrayRemove(...removeLists),
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
