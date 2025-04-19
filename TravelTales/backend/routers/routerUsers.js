import express from 'express'
const routerUsers = express.Router()
import jwt from 'jsonwebtoken'
import database from "../database.js";
import activeApiKeys from '../activeApiKeys.js'
const { db, usersRef } = database;


routerUsers.post("/register", async (req, res) => {
    const { nombre, apellidos, email, contrasena } = req.body;
    let errors = [];
    if (!db) errors.push('Database error')
    if (!email) errors.push("No se ha recibido un email");
    if (!nombre) errors.push("No se ha recibido un nombre");
    if (!apellidos) errors.push("No se han recibido unos apellidos");
    if (!contrasena) errors.push("No se ha recibido una contraseña");
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (snapshot.exists()) {
            return res.status(401).json({ error: "Ya existe un usuario asignado al email introducido" });
        }

        const newUserRef = usersRef.push();
        await newUserRef.set({ email, nombre, apellidos,contrasena });

        res.json({ insertedUser: { id: newUserRef.key, email, nombre, apellidos } });
    } catch {
        res.status(402).json({ error: "Ha habido un error insertando el usuario" });
    }
});

routerUsers.post("/login", async (req, res) => {
    const { email, contrasena } = req.body;
    let errors = [];
    if (!email) errors.push("No se ha recibido un email");
    if (!contrasena) errors.push("No se ha recibido una contraseña");
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (!snapshot.exists()) {
            return res.status(401).json({ error: "Correo no válido" });
        }

        let user = null;
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.val().contrasena === contrasena) {
                user = { id: childSnapshot.key, ...childSnapshot.val() };
            }
        });

        if (!user) return res.status(402).json({ error: "Contraseña incorrecta" });

        const apiKey = jwt.sign({ email: user.email, id: user.id, time: Date.now() }, "secret");
        activeApiKeys.push(apiKey);

        res.json({ apiKey, id: user.id, email: user.email });
    } catch{
        res.status(402).json({ error: "Ha habido un error al realizarse el login" });
    }
});

routerUsers.post("/disconnect", (req, res) => {
    const apiKey = req.query.apiKey;
    if (!apiKey) return res.status(400).json({ error: "Falta la apiKey" });

    const index = activeApiKeys.indexOf(apiKey);
    if (index === -1) return res.status(400).json({ error: "apiKey no registrada en el servidor" });

    activeApiKeys.splice(index, 1);
    res.json({ message: "ApiKey eliminada" });
});


export default routerUsers;