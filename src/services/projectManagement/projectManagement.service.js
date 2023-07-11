import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import {
  isEmpty,
  randomString,
  uploadFiletoStorage,
} from "../../utils/helper.util.js";
import env from "../../configs/firebase.config.js";

const getWorks = async ({ page = 1, pageSize = 2, sortTitle, sortType }) => {
  try {
    const offset = pageSize * (page - 1);
    const db = admin.firestore();
    const snapshot = db.collection("works");
    const workQuery = await snapshot
      .orderBy(sortTitle, sortType)
      .limit(pageSize)
      .offset(offset)
      .get();
    return workQuery.docs.map((res) => {
      return {
        projectID: res.id,
        ...res.data(),
      };
    });
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
      customer: (await workQuery.data().customer.get()).id,
    };
    return result;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const addWork = async ({
  title,
  date = new Date(date),
  detail = "",
  profit = 0,
  images = [],
  customer,
}) => {
  const firstAdd = {
    title,
    date: admin.firestore.Timestamp.fromDate(date),
    detail,
    profit,
    customer: admin.firestore().doc(`customers/${customer}`),
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
  //remove work in database
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
  imagesDelete = [],
  imagesAdd = [],
}) => {
  let body = {
    title,
    date: admin.firestore.Timestamp.fromDate(date),
    detail,
    profit,
    customer: admin.firestore().doc(`customers/${customer}`),
    images: [],
  };
  if (typeof dateEnd !== "undefined") {
    body.dateEnd = admin.firestore.Timestamp.fromDate(new Date(dateEnd));
  } else {
    body.dateEnd = null;
  }
  const db = admin.firestore();
  const storage = admin.storage();

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
      const oldImages = await db
        .collection("works")
        .doc(workID)
        .get()
        .then((res) => {
          return res.data().images;
        });
      const newImages = oldImages.filter(
        (image) => !imagesDelete.includes(image)
      );
      body.images = newImages;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  if (imagesAdd.length > 0) {
    //add file in storage by url
    const urlData = await uploadStorageForProjects(imagesAdd, "works", workID);
    body.images = [...body.images, ...urlData];
  }
  await db
    .collection("works")
    .doc(workID)
    .update(body)
    .catch((error) => {
      throw new BadRequestError(error.message);
    });
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
    const db = admin.firestore();
    const result = await db.collection("works").get();
    return result.size;
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
