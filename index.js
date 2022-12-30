import express from 'express'
import pkg from 'body-parser'
import { https } from 'firebase-functions'
import firebaseconfig from './src/configs/firebase.config.js'
import errorHandler from './src/middleware/error.js'
import routes from './src/routes/index.js'
import onExit from 'signal-exit'
import fs from 'fs'
import 'express-async-errors'
import { createRequire } from 'module';
import cors from 'cors'

const require = createRequire(import.meta.url);
const env = require('./env_config.json');
const limitedInvoke = require('./limitedInvoke.json');

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

const corsOptions = {
  origin: env.CLIENT_URL,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

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
