import { getHomeDetailData, updateHomeDetailData } from "../../services/websiteManagement/websiteManagement.service.js"


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

async function updateHomeDetail(httpRequest) {
   const body = httpRequest.body
   await updateHomeDetailData(body)
   return {
      statusCode: 200,
      body: {
         messasge: "success"
      }
   }
}

export {
   getHomeDetail as getHome,
   updateHomeDetail as updateHome
}
