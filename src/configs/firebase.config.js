import { initializeApp, cert } from "firebase-admin/app";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const env = require("../../env_config.json");
const serviceAccount = require("../../serviceAccount.json");

function init() {
  initializeApp({
    credential: cert({
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      projectId: serviceAccount.project_id,
    }),
    databaseURL: env.databaseURL,
    storageBucket: env.storageBucket,
  });
}

export default function run() {
  try {
    init();
    console.log("\x1b[34m%s\x1b[0m", "Firebase connected");
  } catch (error) {
    console.error(error);
  }
}
