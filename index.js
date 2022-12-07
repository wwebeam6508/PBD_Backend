import express from 'express'
import pkg from 'body-parser'
import { https } from 'firebase-functions'
import env from './env_config.json' assert { type: "json" }
import firebaseconfig from './src/configs/firebase.config.js'
import authRouter from './src/routes/Auth.route.js'
import errorHandler from './src/middleware/error.js'
import expressAsyncErrors from 'express-async-errors'
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
  res.json({ message: 'ok' })
})
expressAsyncErrors
app.use('/auth', authRouter)
app.use(errorHandler)
/* Error handler middleware */
// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500
//   console.error(err.message, err.stack)
//   res.status(statusCode).json({'message': err.message})

//   return
// })

app.listen(port, () => {
  console.log(`PBDBackend app listening at PORT:${port}`)
});
// process.on('uncaughtException', function (err) {
//   console.error(err);
//   console.log("Node NOT Exiting...");
// });
export const Backend = https.onRequest(app)
