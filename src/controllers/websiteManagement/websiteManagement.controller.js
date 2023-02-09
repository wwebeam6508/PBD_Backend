import { getAboutUsDetailData, getContactUsDetailData, getHomeDetailData, updateAboutUsDetailData, updateContactUsDetailData, updateHomeDetailData } from "../../services/websiteManagement/websiteManagement.service.js"


/**
   * Handle logging in user.
   * @async
   * @method
   * @param {ExpressRequest} httpRequest
   */
async function getHomeDetail() {
   const data = await getHomeDetailData()
   return {
      statusCode: 200,
      body: {
         data: data
      }
   }
}

async function getContactUsDetail() {
   let data = await getContactUsDetailData()
   return {
      statusCode: 200,
      body: {
         data: data
      }
   }
}

async function getAboutUsDetail() {
   let data = await getAboutUsDetailData()
   return {
      statusCode: 200,
      body: {
         data: data
      }
   }
}

async function updateHomeDetail(httpRequest) {
   const body = httpRequest.body
   const data = await updateHomeDetailData(body)
   return {
      statusCode: 200,
      body: {
         data: data,
         messasge: "success"
      }
   }
}

async function updateAboutUsDetail(httpRequest) {
   const body = httpRequest.body
   const data = await updateAboutUsDetailData(body)
   return {
      statusCode: 200,
      body: {
         data: data,
         messasge: "success"
      }
   }
}

async function updateContactUsDetail(httpRequest) {
   const body = httpRequest.body
   const data = await updateContactUsDetailData(body)
   return {
      statusCode: 200,
      body: {
         data: data,
         messasge: "success"
      }
   }
}

export {
   getHomeDetail as getHome,
   getContactUsDetail as getContactUs,
   getAboutUsDetail as getAboutUs,
   updateHomeDetail as updateHome,
   updateAboutUsDetail as updateAboutUs,
   updateContactUsDetail as updateContactUs
}
