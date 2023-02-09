import admin from 'firebase-admin'
import { uuid } from 'uuidv4'
function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage]
}

function emptyOrRows(rows) {
  if (!rows) {
    return []
  }
  return rows
}

function pageArray(totalSize, pageSize, page, maxLength) {
  const currentPage = Number(page)
  const current_position = Math.floor(maxLength / 2)
  const totalPage = Math.ceil(totalSize / pageSize)

  const startPoint = currentPage - current_position >= 1 ? currentPage - current_position : 1
  const endPoint = currentPage + current_position <= totalPage ? currentPage + current_position : totalPage
  let pages = []
  if (startPoint !== 1) {
    pages.push("...")
  }
  for (let i = startPoint; i <= endPoint; i++) {
    pages.push(i)
  }
  if (endPoint !== totalPage) {
    pages.push("...")
  }
  return pages
}

//function with random unique id string
function randomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function isEmpty(str) {
  if (typeof str === 'string' || typeof str === 'number') {
    return (!str || /^\s*$/.test(str))
  }
  return true
}

const conditionEmptyฺBody = (body) => {
  let data = {}
  for (const key in body) {
    if (Array.isArray(body[key])) {
      let array = []
      for (let i = 0; i < body[key].length; i++) {
        array.push(conditionEmptyฺBody(body[key][i]))
      }
      data[key] = array
    }
    else if (typeof body[key] === 'object') {
      data[key] = conditionEmptyฺBody(body[key])
    } else {
      if (!isEmpty(body[key])) {
        data[key] = body[key]
      }
    }
  }
  return data
}

const uploadFiletoStorage = (image, path, filename) => {
  return new Promise(async (resolve, reject) => {
    const uid = uuid()
    const bucket = admin.storage().bucket()
    const file = bucket.file(`${path}/${filename}.jpg`);
    const blobStream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          firebaseStorageDownloadTokens: uid
        }
      },
      resumable: true,
      public: true,
      validation: 'md5'
    });
    blobStream.on('error', (error) => {
      reject(error);
    });
    blobStream.on('finish', () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${uid}`
      resolve(publicUrl)
    })
    blobStream.end(Buffer(image.split(';base64,')[1], 'base64'));
  })
}


export {
  isEmpty,
  randomString,
  pageArray,
  getOffset,
  emptyOrRows,
  uploadFiletoStorage,
  conditionEmptyฺBody
}
