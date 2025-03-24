const admin = require("firebase-admin");


admin.initializeApp({
    credential: admin.credential.cert(require("./credenciales.json")), 
    databaseURL: "https://traveltales-1653b-default-rtdb.europe-west1.firebasedatabase.app"
  });
  
const db = admin.database();
const usersRef = db.ref("users"); 
  
module.exports = { db, usersRef };