import express from 'express'
let routerViajes = express.Router()
import database from "../database.js";
const { db, usersRef, viajesRef } = database;

routerViajes.post("/anadir", async (req, res) => {
    const { nombre, ubicacion, fechaIni, fechaFin, num } = req.body;
    let errors = [];
    if (!db) errors.push('Database error')
    if (!nombre) errors.push("No se ha recibido un nombre");
    if (!ubicacion) errors.push("No se ha recibido una ubicación");
    if (!fechaIni) errors.push("No se han recibido una fecha de inicio");
    if (!fechaFin) errors.push("No se han recibido una fecha de finalización");
    if (!num) errors.push("No se ha recibido un número de personas");
    let email=req.infoApiKey.email
    if (email == null) errors.push("No se ha recibido el correo del usuario");

    const fechaRegex =/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    if (fechaIni && !fechaRegex.test(fechaIni)) errors.push("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    if (fechaFin && !fechaRegex.test(fechaFin)) errors.push("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");

    const parseFecha = (fecha) => {
        const [año, mes, dia] = fecha.split('-').map(Number);
        
        const fechaDate = new Date(año, mes - 1, dia);

        if (fechaDate.getFullYear() !== año || fechaDate.getMonth() !== mes - 1 || fechaDate.getDate() !== dia) {
            throw new Error("La fecha no es válida, el día no corresponde al mes.");
        }

        return fechaDate;
    };

    if (fechaIni && fechaFin && fechaRegex.test(fechaIni) && fechaRegex.test(fechaFin)) {
        try {
            const fechaInicioDate = parseFecha(fechaIni);
            const fechaFinDate = parseFecha(fechaFin);

            if (fechaFinDate <= fechaInicioDate) {
                errors.push("La fecha de finalización debe ser posterior a la fecha de inicio");
            }
        } catch (error) {
            errors.push(error.message);
        }
    }
    

    if (num && (!Number.isInteger(Number(num)) || Number(num) < 1)) {
        errors.push("El número de personas debe ser un número entero mayor o igual a 1");
    }

    const ubicacionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s.,/-]{2,}$/;

    if (ubicacion && !ubicacionRegex.test(ubicacion)) {
        errors.push("La ubicación debe comenzar con una letra, tener al menos 3 caracteres y solo contener letras, números y caracteres especiales (.,/ -).");
    }

    console.log(errors)
    if (errors.length > 0) return res.status(400).json({ errors });


    try {
        const snapshot2 = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (!snapshot2.exists()) {
            return res.status(401).json({ error: "No existe un usuario con ese correo" });
        }else{
            const snapshot = await viajesRef.orderByChild("correoUser").equalTo(email).once("value");
            if (snapshot.exists()) {
                const viajes = snapshot.val();
                const viajeConMismoNombre = Object.values(viajes).find(viaje => viaje.nombre === nombre);
        
                if (viajeConMismoNombre) {
                    return res.status(401).json({ error: "Ya has creado un viaje con el mismo nombre" });
                }
            }
        }

        let planificacion=false
        const newViajeRef = viajesRef.push();
        await newViajeRef.set({ nombre, ubicacion, fechaIni, fechaFin, num, email });

        res.json({ viajeAnadido: { id: newViajeRef.key, nombre, ubicacion, fechaIni, fechaFin, num, email } });
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

export default routerViajes