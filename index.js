import express from 'express'
import pkg from 'body-parser'
import { https } from 'firebase-functions'
import env from './env_config.json' assert { type: "json" }
import firebaseconfig from './src/configs/firebase.config.js'
import errorHandler from './src/middleware/error.js'
import 'express-async-errors'
import routes from './src/routes/index.js'


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

app.get('/', (req, res) => {
  res.json({ message: 'what are you doing?' })
})

routes(app)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`PBDBackend app listening at PORT:${port}`)
})


export const Backend = https.onRequest(app)
