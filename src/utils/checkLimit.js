import moment from "moment/moment.js"
import { AccessDeniedError } from "./api-errors.js"

export default function checkLimit(req) {
    const local_variable = req.app.locals
    const compareTimeDay = moment(local_variable.locals).diff(moment(), 'days')
    if(compareTimeDay != 0) {
      req.app.locals.count = 0
      req.app.locals.date = moment().format(`DD/MM/YYYY`)
    }
    if(local_variable.count >= local_variable.limit ) throw new AccessDeniedError("has been exceeded limit")
    req.app.locals.count = req.app.locals.count + 1
    req.app.locals.date = moment().format(`DD/MM/YYYY`)
}