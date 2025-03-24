import express from 'express'
let routerViajes = express.Router()
import database from "../database.js";
const { db, usersRef } = database;


routerViajes.get("/", async (req, res) => {
    try {
        const viajesRef = db.collection("viajes");
        const snapshot = await viajesRef.get();
        const viajes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(viajes);
    } catch {
        res.status(500).json({ error: "Error obteniendo datos" });
    }
});

export default routerViajes