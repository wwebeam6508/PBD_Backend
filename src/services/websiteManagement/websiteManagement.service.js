import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import {
  conditionEmptyฺBody,
  uploadFiletoStorage,
} from "../../utils/helper.util.js";

const getHomeDetailData = async () => {
  try {
    const db = admin.firestore();
    const response = await db.doc("home/detail").get();
    return response.data();
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getContactUsDetailData = async () => {
  try {
    const db = admin.firestore();
    const response = await db.doc("contactUs/detail").get();
    return response.data();
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getAboutUsDetailData = async () => {
  try {
    const db = admin.firestore();
    const response = await db.doc("about/detail").get();
    return response.data();
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const updateHomeDetailData = async (body) => {
  return new Promise((resolve) => {
    try {
      let data = conditionEmptyฺBody(body);
      data = uploadStorage(data, "home");
      const db = admin.firestore();
      db.doc("home/detail")
        .update(data)
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
      resolve(data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });
};

const updateAboutUsDetailData = async (body) => {
  return new Promise((resolve) => {
    try {
      let data = conditionEmptyฺBody(body);
      data = uploadStorage(data, "about");
      const db = admin.firestore();
      db.doc("about/detail")
        .update(data)
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
      resolve(data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });
};

const updateContactUsDetailData = async (body) => {
  return new Promise((resolve) => {
    try {
      let data = conditionEmptyฺBody(body);
      if (data.geolocation) {
        data.geolocation = new admin.firestore.GeoPoint(
          data.geolocation._latitude,
          data.geolocation._longitude
        );
      }
      data = uploadStorage(data, "contactUs");
      const db = admin.firestore();
      db.doc("contactUs/detail")
        .update(data)
        .catch((error) => {
          throw new BadRequestError(error.message);
        });
      resolve(data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  });
};

const uploadStorage = async (data, path) => {
  let newData = data;
  for (const key in newData) {
    if (typeof newData[key] === "object") {
      newData[key] = await uploadStorage(newData[key], path);
    } else {
      if (typeof newData[key] === "string") {
        if (newData[key].includes("data:image")) {
          const image = newData[key];
          const filename = key;
          const url = await uploadFiletoStorage(image, path, filename);
          newData[key] = url;
        }
      }
    }
  }
  return newData;
};

export {
  getContactUsDetailData,
  getHomeDetailData,
  getAboutUsDetailData,
  updateHomeDetailData,
  updateAboutUsDetailData,
  updateContactUsDetailData,
};
