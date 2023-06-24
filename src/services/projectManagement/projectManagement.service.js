import admin from "firebase-admin";
import { BadRequestError } from "../../utils/api-errors.js";
import { randomString } from "../../utils/helper.util.js";

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
      return res.data();
    });
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
  contractor,
}) => {
  const body = {
    title,
    date: admin.firestore.Timestamp.fromDate(date),
    detail,
    profit,
    images,
    contractor,
  };
  const db = admin.firestore();
  await db
    .collection("works")
    .add(body)
    .catch((error) => {
      throw new BadRequestError(error.message);
    });
};

const deleteWork = async ({ workID }) => {
  const db = admin.firestore();
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
  detail = "",
  profit = 0,
  images = [],
  contractor,
}) => {
  let body = {
    title,
    date: admin.firestore.Timestamp.fromDate(date),
    detail,
    profit,
    images: [],
    contractor,
  };
  const db = admin.firestore();
  const storage = admin.storage();

  if (images.length > 0) {
    try {
      const oldImages = await db
        .collection("works")
        .doc(workID)
        .get()
        .then((res) => {
          return res.data().images;
        });
      const newImages = images.filter((image) => !oldImages.includes(image));

      await Promise.all(
        newImages.map(async (image) => {
          const file = storage.bucket().file(image);
          await file.save(image, {
            metadata: {
              contentType: "jpeg",
            },
            destination: `works/${workID}/${randomString(10)}`,
            public: true,
            validation: "md5",
          });
          return file.getSignedUrl({
            action: "read",
          });
        })
      ).then((urls) => {
        body.images = [...oldImages, ...urls];
      });
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  await db
    .collection("works")
    .doc(workID)
    .update(body)
    .catch((error) => {
      throw new BadRequestError(error.message);
    });
};

const getAllWorksCount = async () => {
  try {
    const db = admin.firestore();
    const result = await db.collection("works").get();
    return result.size;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export { deleteWork, addWork, updateWork, getWorks, getAllWorksCount };
