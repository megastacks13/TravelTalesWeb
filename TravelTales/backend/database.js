import 'dotenv/config'; // Load .env file into process.env
import admin from 'firebase-admin';

const credencialesData = process.env.FIREBASE_CREDENTIALS; // Now using process.env
const urlFirebase = process.env.FIREBASE_URL;

if (!credencialesData) {
    throw new Error("Las credenciales de Firebase no están definidas en las variables de entorno.");
}

if (!urlFirebase) {
  throw new Error("La URL no existe");
}

const credenciales = JSON.parse(credencialesData); 

admin.initializeApp({
    credential: admin.credential.cert(credenciales), 
    databaseURL: urlFirebase
});
  
const db = admin.database();
const usersRef = db.ref("users"); 
const viajesRef = db.ref("viajes"); 
  
export default { db, usersRef, viajesRef };