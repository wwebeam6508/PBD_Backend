import { BadRequestError } from "../utils/api-errors.js";
import env from '../../env_config.json' assert { type: "json" }
import admin from "firebase-admin";
import { updateLimitData } from "../../loadChecklimit.js";
import moment from "moment/moment.js";

export default (controller) => async (req, res,next) => {
    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      cookie: req.cookie,
      headers: {
        'Content-Type': req.get('Content-Type'),
        Authorization: req.get('Authorization'),
        Referer: req.get('referer'),
        'User-Agent': req.get('User-Agent')
      }
    };
    if(env.isLimitOn){
      await checkLimit(req)
    }
    try {
      const httpResponse = await controller(httpRequest);
      if (httpResponse.headers) res.set(httpResponse.headers);
      if (httpResponse.cookie) {
          for (const key in httpResponse.cookie) {
              if (Object.hasOwnProperty.call(httpResponse.cookie, key)) {
                  res.cookie(key, httpResponse.cookie[key], { httpOnly: true, 
                      sameSite: 'None', secure: true, 
                      maxAge: 24 * 60 * 60 * 1000 });
              }
          }
      }
      return res.status(httpResponse.statusCode).send(httpResponse.body);
    } catch (error) {
      next(error)
    }
};

// checklimit and update limitdata
async function checkLimit(req) {
  const local_variable = req.app.locals
  const compareTimeDay = moment(new Date(req.app.locals.date._seconds*1000)).diff(new Date(), 'days')
  if(compareTimeDay != 0) {
    req.app.locals.count = 0
    req.app.locals.date = admin.firestore.Timestamp.fromDate(new Date())
  }
  if(local_variable.count >= local_variable.limit ) throw new BadRequestError("has been exceeded limit")
  req.app.locals.count = req.app.locals.count + 1
  req.app.locals.date = admin.firestore.Timestamp.fromDate(new Date())
  await updateLimitData(req.app.locals.count, req.app.locals.date)
}
