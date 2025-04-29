import express from 'express'
const routerUsers = express.Router()
import jwt from 'jsonwebtoken'
import database from "../database.js";
import activeApiKeys from '../activeApiKeys.js'
const { db, usersRef } = database;
import appErrors from '../errors.js';


routerUsers.post("/register", async (req, res) => {
    const { nombre, apellidos, email, contrasena } = req.body;
    let errors = [];
    if (!db) errors.push('Database error')
    if (!email) errors.push("No se ha recibido un email");
    if (!nombre) errors.push("No se ha recibido un nombre");
    if (!apellidos) errors.push("No se han recibido unos apellidos");
    if (!contrasena) errors.push("No se ha recibido una contraseña");
    if (errors.length > 0) return appErrors.throwError(res, appErrors.MISSING_ARGUMENT_ERROR, errors)

    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (snapshot.exists()) {
            return appErrors.throwError(res, appErrors.UNIQUE_KEY_VIOLATION_ERROR, "Ya existe un usuario asignado al email introducido")
        }

        const newUserRef = usersRef.push();
        await newUserRef.set({ email, nombre, apellidos,contrasena });

        res.json({ insertedUser: { id: newUserRef.key, email, nombre, apellidos } });
    } catch {
        return appErrors.throwError(res, appErrors.OPERATION_FAILED_ERROR, "Ha habido un error interno insertando el usuario");
    }
});

routerUsers.post("/login", async (req, res) => {
    const { email, contrasena } = req.body;
    let errors = [];
    if (!email) errors.push("No se ha recibido un email");
    if (!contrasena) errors.push("No se ha recibido una contraseña");
    if (errors.length > 0) return appErrors.throwError(res, appErrors.MISSING_ARGUMENT_ERROR, errors)

    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        
        if (!snapshot.exists()) return appErrors.throwError(res, appErrors.DATA_NOT_FOUND_ERROR, "Correo no registrado")
        
        let user = null;
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.val().contrasena === contrasena) {
                user = { id: childSnapshot.key, ...childSnapshot.val() };
            }
        });
        if (!user) return appErrors.throwError(res, appErrors.INVALID_ARGUMENT_ERROR, "Contraseña incorrecta")

        const apiKey = jwt.sign({ email: user.email, id: user.id, time: Date.now() }, "secret");
        activeApiKeys.push(apiKey);

        res.json({ apiKey, id: user.id, email: user.email });
    } catch{
        return appErrors.throwError(res, appErrors.OPERATION_FAILED_ERROR, "Ha habido un error interno al realizar el login");
    }
});

routerUsers.post("/disconnect", (req, res) => {
    const apiKey = req.query.apiKey;
    if (!apiKey) return appErrors.throwError(res, appErrors.MISSING_ARGUMENT_ERROR, "Falta la apiKey")

    const index = activeApiKeys.indexOf(apiKey);
    if (index === -1) return appErrors.throwError(res, appErrors.API_NOT_FOUND_ERROR, "apiKey no registrada en el servidor")

    activeApiKeys.splice(index, 1);
    res.json({ message: "ApiKey eliminada" });
});


export default routerUsers;