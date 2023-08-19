import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import { uploadFiletoStorage } from "../../utils/helper.util.js";
import env from "../../configs/firebase.config.js";

const getWorks = async ({ page = 1, pageSize = 2, sortTitle, sortType }) => {
  try {
    const offset = pageSize * (page - 1);
    const db = admin.firestore();
    const snapshot = db.collection("works");
    let workQuery = snapshot.limit(pageSize).offset(offset);
    if (sortTitle && sortType) {
      workQuery = workQuery.orderBy(sortTitle, sortType);
    }
    const total = await workQuery.get();
    const result = await Promise.all(
      total.docs.map(async (res) => {
        return {
          projectID: res.id,
          ...res.data(),
          //check customer type ref or string
          customer:
            typeof res.data().customer === "string"
              ? res.data().customer
              : (await res.data().customer.get()).data().name,
        };
      })
    );
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getWorksByID = async ({ workID }) => {
  try {
    const db = admin.firestore();
    const snapshot = db.collection("works").doc(workID);
    const workQuery = await snapshot.get();
    let result = {
      ...workQuery.data(),
      projectID: workQuery.id,
      customer:
        typeof workQuery.data().customer === "string"
          ? workQuery.data().customer
          : (await workQuery.data().customer.get()).id,
    };
    result.isCustomerRef = typeof workQuery.data().customer === "object";
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addWork = async ({
  title,
  date = new Date(date),
  dateEnd,
  detail = "",
  profit = 0,
  images = [],
  customer,
  isCustomerRef,
}) => {
  const firstAdd = {
    title,
    date: admin.firestore.Timestamp.fromDate(date),
    detail,
    profit,
    dateEnd: dateEnd ? admin.firestore.Timestamp.fromDate(dateEnd) : null,
    customer: isCustomerRef
      ? admin.firestore().doc(`customers/${customer}`)
      : customer,
  };
  const db = admin.firestore();
  await db
    .collection("works")
    .add(firstAdd)
    .catch((error) => {
      throw new BadRequestError(error.message);
    })
    .then(async (res) => {
      const workID = res.id;
      if (images.length > 0) {
        const urlData = await uploadStorageForProjects(images, "works", workID);
        await db
          .collection("works")
          .doc(workID)
          .update({ images: urlData })
          .catch((error) => {
            throw new BadRequestError(error.message);
          });
      }
    });
};

const deleteWork = async ({ workID }) => {
  // check if project has any expenses in reference
  const expenseData = await db
    .collection("expenses")
    .where("workRef", "==", db.doc(`works/${workID}`))
    .get();
  if (expenseData.size > 0) {
    const nameOfExpenses = expenseData.docs.map((res) => res.data().title);
    let listMessage = "";
    nameOfExpenses.forEach((name) => {
      listMessage += `${name}, `;
    });
    listMessage = listMessage.substring(0, listMessage.length - 2);

    throw new BadRequestError(
      `ไม่สามารถลบงานได้เนื่องจากมีรายการค่าใช้จ่ายที่อ้างอิงถึงงานนี้ โดยมีรายการค่าใช้จ่ายดังนี้ ${listMessage}`
    );
  }
  const db = admin.firestore();
  //remove images in storage
  const workData = await getWorksByID({ workID });
  if (workData.images && workData.images.length > 0) {
    await Promise.all(
      workData.images.map(async (image) => {
        const fileName = `works/${getPathStorageFromUrl(image)}`;
        await admin
          .storage()
          .bucket()
          .file(fileName)
          .delete()
          .catch((error) => {
            throw new BadRequestError(error.message);
          });
      })
    );
  }

  //delete project
  await db
    .collection("works")
    .doc(workID)
    .delete()
    .catch((error) => {
      throw new BadRequestError(error.message);
    });
};

const updateWork = async ({
  workID,
  title,
  date = new Date(date),
  dateEnd,
  detail = "",
  profit = 0,
  customer,
  isCustomerRef,
  imagesDelete = [],
  imagesAdd = [],
}) => {
  let body = {
    title,
    date: admin.firestore.Timestamp.fromDate(date),
    detail,
    profit,
    customer: isCustomerRef
      ? admin.firestore().doc(`customers/${customer}`)
      : customer,
  };
  if (typeof dateEnd !== "undefined") {
    body.dateEnd = admin.firestore.Timestamp.fromDate(new Date(dateEnd));
  } else {
    body.dateEnd = null;
  }
  const db = admin.firestore();
  const storage = admin.storage();

  await db
    .collection("works")
    .doc(workID)
    .update({
      ...body,
    })
    .catch((error) => {
      throw new BadRequestError(error.message);
    });

  if (imagesDelete.length > 0) {
    //delete file in storage by url
    try {
      await Promise.all(
        imagesDelete.map(async (image) => {
          const fileName = `works/${getPathStorageFromUrl(image)}`;
          const file = storage.bucket().file(fileName);
          await file.delete();
        })
      );
    } catch (error) {
      throw new BadRequestError(error.message);
    }
    //delete url in database
    try {
      await db
        .collection("works")
        .doc(workID)
        .update({
          //array remove
          images: admin.firestore.FieldValue.arrayRemove(...imagesDelete),
        });
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  let imagetoAdd = [];
  if (imagesAdd.length > 0) {
    //add file in storage by url
    const urlData = await uploadStorageForProjects(imagesAdd, "works", workID);
    imagetoAdd = [...urlData];
    await db
      .collection("works")
      .doc(workID)
      .update({
        //array union
        images: admin.firestore.FieldValue.arrayUnion(...imagetoAdd),
      })
      .catch((error) => {
        throw new BadRequestError(error.message);
      });
  }
};

function getPathStorageFromUrl(url) {
  const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${env.storageBucket}/o/`;

  let imagePath = url.replace(baseUrl, "");

  const indexOfEndPath = imagePath.indexOf("?");

  imagePath = imagePath.substring(0, indexOfEndPath);

  imagePath = imagePath.replace("%2F", "/");
  imagePath = imagePath.split("/");
  imagePath = imagePath[imagePath.length - 1];
  return imagePath;
}

const getAllWorksCount = async () => {
  try {
    const firestore = admin.firestore();
    const workDoc = await firestore.collection("works").count().get();
    return workDoc.data().count;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getCustomerName = async () => {
  try {
    const db = admin.firestore();
    const result = await db.collection("customers").get();
    return result.docs.map((res) => {
      return {
        id: res.id,
        name: res.data().name,
      };
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const uploadStorageForProjects = async (images, path, workID) => {
  let imagesURL = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filename = `${workID}_${i}`;
    const url = await uploadFiletoStorage(image, path, filename);
    imagesURL.push(url);
  }
  return imagesURL;
};

export {
  deleteWork,
  addWork,
  updateWork,
  getWorks,
  getAllWorksCount,
  getCustomerName,
  getWorksByID,
};
