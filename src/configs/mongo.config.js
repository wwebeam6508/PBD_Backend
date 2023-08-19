import { MongoClient, ServerApiVersion } from "mongodb";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const env = require("../../env_config.json");
const uri = env.mongoDB;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
export default async function mongoDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const conn = await client.connect();
    // Send a ping to confirm a successful connection
    //console.log with color blue
    return conn.db(env.mongoDBName);
  } catch (e) {
    // Ensures that the client will close when you finish/error
    console.log(e);
    await client.close();
  }
}
