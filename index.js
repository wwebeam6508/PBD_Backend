import express from 'express'
import pkg from 'body-parser'
import { https } from 'firebase-functions'
import env from './env_config.json' assert { type: "json" }
import limitedInvoke from './limitedInvoke.json' assert { type: "json" }
import firebaseconfig from './src/configs/firebase.config.js'
import errorHandler from './src/middleware/error.js'
import routes from './src/routes/index.js'
import onExit from 'signal-exit'
import fs from 'fs'
import 'express-async-errors'

const port = env.NODE_PORT || 3000
const app = express()
const { json, urlencoded } = pkg

firebaseconfig()
app.use(json())
app.use(
  urlencoded({
    extended: true
  })
)

if(env.isLimitOn){
  app.locals.limit = limitedInvoke.limit
  app.locals.count = limitedInvoke.count
  app.locals.date = limitedInvoke.date
}

app.get('/', (req, res) => {
  res.json({ message: 'what are you doing?' })
})

routes(app)


onExit( ()=>{
  try {
    fs.writeFileSync('limitedInvoke.json', JSON.stringify({
      limit: app.locals.limit,
      count: app.locals.count,
      date: app.locals.date
    }))
  } catch (error) {
    console.error(error);         
  }
})

app.use(errorHandler)
app.listen(port, () => {
  console.log(`PBDBackend app listening at PORT:${port}`)
})


export const Backend = https.onRequest(app)
