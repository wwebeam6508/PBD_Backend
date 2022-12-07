import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from '../../serviceAccount.json' assert { type: "json" };
import env from '../../env_config.json'assert { type: "json" };

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
