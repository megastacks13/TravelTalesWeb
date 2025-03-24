import express from 'express'
let routerUsers = express.Router()
import jwt from 'jsonwebtoken'
import database from "../database.js";
import activeApiKeys from '../activeApiKeys.js'
const { db, usersRef } = database;


routerUsers.post("/", async (req, res) => {
    const { email, name, password } = req.body;
    let errors = [];
    if (!db) errors.push('db undefined')
    if (!email) errors.push("no email");
    if (!name) errors.push("no name");
    if (!password) errors.push("no password");
    if (password && password.length < 5) errors.push("password shorter than 5");
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (snapshot.exists()) {
            return res.status(400).json({ error: "already user with that email" });
        }

        const newUserRef = usersRef.push();
        await newUserRef.set({ email, name, password });

        res.json({ insertedUser: { id: newUserRef.key, email, name } });
    } catch {
        res.status(400).json({ error: "problem inserting the user" });
    }
});

routerUsers.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let errors = [];

    if (!email) errors.push("no email");
    if (!password) errors.push("no password");
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (!snapshot.exists()) {
            return res.status(401).json({ error: "invalid email or password" });
        }

        let user = null;
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.val().password === password) {
                user = { id: childSnapshot.key, ...childSnapshot.val() };
            }
        });

        if (!user) return res.status(401).json({ error: "invalid email or password" });

        const apiKey = jwt.sign({ email: user.email, id: user.id, time: Date.now() }, "secret");
        activeApiKeys.push(apiKey);

        res.json({ apiKey, id: user.id, email: user.email });
    } catch {
        res.status(400).json({ error: "error in login" });
    }
});

routerUsers.post("/disconnect", (req, res) => {
    const apiKey = req.query.apiKey;
    if (!apiKey) return res.status(400).json({ error: "no apiKey" });

    const index = activeApiKeys.indexOf(apiKey);
    if (index === -1) return res.status(400).json({ error: "apiKey not registered" });

    activeApiKeys.splice(index, 1);
    res.json({ message: "apiKey deleted" });
});


export default routerUsers;