import express from 'express'
let routerViajes = express.Router()
import database from "../database.js";
const { db, usersRef, viajesRef } = database;

routerViajes.post("/anadir", async (req, res) => {
    const { nombre, ubicacion, fechaIni, fechaFin, num, correoUser } = req.body;
    let errors = [];
    if (!db) errors.push('Database error')
    if (!nombre) errors.push("No se ha recibido un nombre");
    if (!ubicacion) errors.push("No se ha recibido una ubicación");
    if (!fechaIni) errors.push("No se han recibido una fecha de inicio");
    if (!fechaFin) errors.push("No se han recibido una fecha de finalización");
    if (!num) errors.push("No se ha recibido un número de personas");
    if (!correoUser) errors.push("No se ha recibido el correo del usuario");

    const fechaRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (fechaIni && !fechaRegex.test(fechaIni)) errors.push("La fecha de inicio no tiene el formato dd/mm/yyyy");
    if (fechaFin && !fechaRegex.test(fechaFin)) errors.push("La fecha de finalización no tiene el formato dd/mm/yyyy");

    const parseFecha = (fecha) => {
        const [dia, mes, año] = fecha.split('/').map(Number);
        return new Date(año, mes - 1, dia); 
    };

    if (fechaIni && fechaFin && fechaRegex.test(fechaIni) && fechaRegex.test(fechaFin)) {
        const fechaInicioDate = parseFecha(fechaIni);
        const fechaFinDate = parseFecha(fechaFin);

        if (fechaFinDate <= fechaInicioDate) {
            errors.push("La fecha de finalización debe ser posterior a la fecha de inicio");
        }
    }

    if (num && (!Number.isInteger(Number(num)) || Number(num) < 1)) {
        errors.push("El número de personas debe ser un número entero mayor o igual a 1");
    }

    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot2 = await usersRef.orderByChild("email").equalTo(correoUser).once("value");
        if (!snapshot2.exists()) {
            return res.status(401).json({ error: "No existe un usuario con ese correo" });
        }else{
            const snapshot = await viajesRef.orderByChild("correoUser").equalTo(correoUser).once("value");
            if (snapshot.exists()) {
                const viajes = snapshot.val();
                const viajeConMismoNombre = Object.values(viajes).find(viaje => viaje.nombre === nombre);
        
                if (viajeConMismoNombre) {
                    return res.status(401).json({ error: "Ya has creado una viaje con el mismo nombre" });
                }
            }
        }

        const newViajeRef = viajesRef.push();
        await newViajeRef.set({ nombre, ubicacion, fechaIni, fechaFin, num, correoUser });

        res.json({ viajeAnadido: { id: newViajeRef.key, nombre, ubicacion, fechaIni, fechaFin, num, correoUser } });
    } catch {
        res.status(402).json({ error: "Ha habido un error insertando el viaje" });
    }
});

export default routerViajes