// backend/database.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import 'dotenv/config';   //  .env
//import admin from 'firebase-admin';


dotenv.config();

// Asegurarnos de que la variable existe
if (!process.env.FIREBASE_CREDENTIALS) {
  throw new Error('FIREBASE_CREDENTIALS no está definido en el .env');
}

let serviceAccount;
try {
  // Parseamos el string JSON
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (e) {
  throw new Error('FIREBASE_CREDENTIALS no es un JSON válido: ' + e.message);
}

// URL de tu RTDB desde el .env
const databaseURL = process.env.FIREBASE_URL;
if (!databaseURL) {
  throw new Error('FIREBASE_URL no está definido en el .env');
}

// Inicializamos la app de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
});

// Exportamos referencias útiles
const db = admin.database();
const usersRef  = db.ref('users');
const viajesRef = db.ref('viajes');
const blogsRef  = db.ref('blogs');  // si lo usas

export default { db, usersRef, viajesRef, blogsRef };
