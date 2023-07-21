import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";

const getCustomers = async ({
  page = 1,
  pageSize = 5,
  sortTitle,
  sortType,
}) => {
  try {
    const offset = pageSize * (page - 1);
    const db = admin.firestore();
    const snapshot = db.collection("customers");
    const customerQuery = snapshot.limit(pageSize).offset(offset);
    if (sortTitle && sortType) {
      customerQuery.orderBy(sortTitle, sortType);
    }
    const total = await customerQuery.get();
    const result = await Promise.all(
      total.docs.map(async (res) => {
        return {
          customerID: res.id,
          ...res.data(),
        };
      })
    );
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getCustomerByID = async ({ customerID }) => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("customers").doc(customerID);
    const customerQuery = await snapshot.get();
    let result = {
      projectID: customerQuery.id,
      ...customerQuery.data(),
    };
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addCustomer = async ({
  name,
  address = "",
  taxID = "",
  phones = [],
  emails = [],
}) => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("customers");
    const customerQuery = await snapshot.add({
      name,
      address,
      taxID,
      phones,
      emails,
    });
    return customerQuery.id;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateCustomer = async ({
  customerID,
  name,
  address = "",
  taxID = "",
  addPhones = [],
  addEmails = [],
  removePhones = [],
  removeEmails = [],
}) => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("customers").doc(customerID);
    const customerQuery = await snapshot.update({
      name,
      address,
      taxID,
    });

    if (addPhones.length > 0) {
      await snapshot.update({
        phones: admin.firestore.FieldValue.arrayUnion(...addPhones),
      });
    }
    if (addEmails.length > 0) {
      await snapshot.update({
        emails: admin.firestore.FieldValue.arrayUnion(...addEmails),
      });
    }

    if (removePhones.length > 0) {
      await snapshot.update({
        phones: admin.firestore.FieldValue.arrayRemove(...removePhones),
      });
    }

    if (removeEmails.length > 0) {
      await snapshot.update({
        emails: admin.firestore.FieldValue.arrayRemove(...removeEmails),
      });
    }
    return customerQuery.id;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const deleteCustomer = async ({ customerID }) => {
  try {
    // check if customer has any project in reference
    const db = admin.firestore();
    const snapshot = db.collection("works");
    const customerQuery = await snapshot
      .where("customer", "==", admin.firestore().doc(`customers/${customerID}`))
      .get();
    if (customerQuery.docs.length > 0) {
      //list of customers name
      let customerName = customerQuery.docs.map((res) => {
        return res.data().title;
      });
      let messageList = "";
      customerName.forEach((res) => {
        messageList += `{${res}}, `;
      });
      messageList = messageList.slice(0, -2);

      throw new BadRequestError(
        `ไม่สามารถลบได้เนื่องจากมีโปรเจค ${messageList} อยู่ในระบบ`
      );
    }
    await db.collection("customers").doc(customerID).delete();
    return true;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getCustomersCount = async () => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("customers");
    const customerQuery = await snapshot.get();
    return customerQuery.docs.length;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  getCustomersCount,
  getCustomers,
  getCustomerByID,
  addCustomer,
  updateCustomer,
  deleteCustomer,
};
