import admin from 'firebase-admin'
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const credenciales = require("./credenciales.json"); // Ajusta la ruta si es necesario



admin.initializeApp({
    credential: admin.credential.cert(credenciales), 
    databaseURL: "https://traveltales-1653b-default-rtdb.europe-west1.firebasedatabase.app"
  });
  
const db = admin.database();
const usersRef = db.ref("users"); 
  
export default {db , usersRef}