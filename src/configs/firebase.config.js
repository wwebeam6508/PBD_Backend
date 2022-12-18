import { initializeApp, cert } from "firebase-admin/app";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const env = require('../../env_config.json');
const serviceAccount = require('../../serviceAccount.json');


export default function init() {
  initializeApp({
    credential: cert({
      clientEmail:serviceAccount.client_email,
      privateKey:serviceAccount.private_key.replace(/\\n/g, '\n'),
      projectId:serviceAccount.project_id
    }),
    databaseURL:env.databaseURL
  });
}
