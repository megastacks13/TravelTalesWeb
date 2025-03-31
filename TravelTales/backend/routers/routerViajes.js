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

        let planificacion=false
        let blog=false
        const newViajeRef = viajesRef.push();
        await newViajeRef.set({ nombre, ubicacion, fechaIni, fechaFin, num, correoUser, planificacion, blog });

        res.json({ viajeAnadido: { id: newViajeRef.key, nombre, ubicacion, fechaIni, fechaFin, num, correoUser, planificacion } });
    } catch {
        res.status(402).json({ error: "Ha habido un error insertando el viaje" });
    }
});

routerViajes.post("/anadirPlanificacion", async (req, res) => {
    const { idViaje } = req.query;
    let errors = [];
    if (!db) errors.push('Database error')
    if (!idViaje) errors.push("No se ha recibido un id de viaje");

    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot = await viajesRef.child(idViaje).once("value");
    
        if (!snapshot.exists()) {
            return res.status(404).json({ error: "No se encontró el viaje con el id proporcionado" });
        }
    
        await viajesRef.child(idViaje).update({ planificacion: true });
    
        res.json({ mensaje: "Se ha crado la planificación del viaje." });
    
    } catch (error) {
        res.status(500).json({ error: "Ha ocurrido un error al crear la planificación del viaje", detalle: error.message });
    }
});

routerViajes.post("/anadirBlog", async (req, res) => {
    const { idViaje } = req.query;
    let errors = [];
    if (!db) errors.push('Database error')
    if (!idViaje) errors.push("No se ha recibido un id de viaje");

    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        const snapshot = await viajesRef.child(idViaje).once("value");
    
        if (!snapshot.exists()) {
            return res.status(404).json({ error: "No se encontró el viaje con el id proporcionado" });
        }
    
        await viajesRef.child(idViaje).update({ blog: true });
    
        res.json({ mensaje: "Se ha creado el blog del viaje." });
    
    } catch (error) {
        res.status(500).json({ error: "Ha ocurrido un error al crear el blog del viaje", detalle: error.message });
    }
});

export default routerViajes