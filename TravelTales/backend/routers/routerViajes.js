const express = require ("express")
let routerViajes = express.Router()
const db = require("../database");

routerViajes.get("/", async (req, res) => {
    try {
        const viajesRef = db.collection("viajes");
        const snapshot = await viajesRef.get();
        const viajes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(viajes);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo datos" });
    }
});

module.exports=routerViajes