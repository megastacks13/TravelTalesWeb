import express from 'express'
let routerViajes = express.Router()
import database from "../database.js";
const { db, usersRef, viajesRef } = database;

//Ruta POST para añadir un viaje nuevo
routerViajes.post("/anadir", async (req, res) => {
    const { nombre, ubicacion, fechaIni, fechaFin, num } = req.body;
    let errors = [];
    
    //Comprobamos si hay errores en la base de datos
    if (!db) errors.push('Database error')
    
        //Comprobamos que se han recibido todos los campos necesarios
    if (!nombre) errors.push("No se ha recibido un nombre");
    if (!ubicacion) errors.push("No se ha recibido una ubicación");
    if (!fechaIni) errors.push("No se han recibido una fecha de inicio");
    if (!fechaFin) errors.push("No se han recibido una fecha de finalización");
    if (!num) errors.push("No se ha recibido un número de personas");
    
    //Obtenemos el email a partir del infoApiKey
    let email=req.infoApiKey.email
    if (email == null) errors.push("No se ha recibido el correo del usuario");

    //Expresión para convertir la fecha en un objeto de tipo DATE
    const fechaRegex =/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    //Comprobamos la validez de las fechas de inicio y fin
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

    //Validación de que la fecha de fin es posterior a la de inicio
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
    
    //Validación de que el número de personas debe ser un entero mayor o igual a 1
    if (num && (!Number.isInteger(Number(num)) || Number(num) < 1)) {
        errors.push("El número de personas debe ser un número entero mayor o igual a 1");
    }

    const ubicacionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s.,/-]{2,}$/;

    //Validación de la correcta ubicación (debe seguir el patrón mencionado)
    if (ubicacion && !ubicacionRegex.test(ubicacion)) {
        errors.push("La ubicación debe comenzar con una letra, tener al menos 3 caracteres y solo contener letras, números y caracteres especiales (.,/ -).");
    }

    //Si hay errores devolvemos código 400 junto a los errores
    console.log(errors)
    if (errors.length > 0) return res.status(400).json({ errors });

    //En otro caso intentamos guaradar el nuevo viaje
    try {
        //Verificamos si el usuario existe
        const snapshot2 = await usersRef.orderByChild("email").equalTo(email).once("value");
        if (!snapshot2.exists()) {
            return res.status(401).json({ error: "No existe un usuario con ese correo" });
        } 
        else
        {
            //Verificamos si el usuario ya tiene un viaje con ese nombre
            const snapshot = await viajesRef.orderByChild("correoUser").equalTo(email).once("value");
            if (snapshot.exists()) {
                const viajes = snapshot.val();
                const viajeConMismoNombre = Object.values(viajes).find(viaje => viaje.nombre === nombre);
        
                if (viajeConMismoNombre) {
                    return res.status(401).json({ error: "Ya has creado un viaje con el mismo nombre" });
                }
            }
        }

        //Si todo es correcto, creamos un nuevo viaje en la base de datos
        const newViajeRef = viajesRef.push();
        await newViajeRef.set({ nombre, ubicacion, fechaIni, fechaFin, num, email });

        //Devolvemos el viaje que acabamos de añadir con su ID generado automáticamente
        res.json({ viajeAnadido: { id: newViajeRef.key, nombre, ubicacion, fechaIni, fechaFin, num, email } });
    } catch {
        //Devolvemos el error 402 si hubo algún problema al insertar el viaje
        res.status(402).json({ error: "Ha habido un error insertando el viaje" });
    }
});

//Ruta GET para obtener un viaje específico por su ID
routerViajes.get("/:id",async(req,res)=>{
    const id = req.params.id
    let email=req.infoApiKey.email
    
    //Verificamos que el ID obtenido sea válido
    if(!id){
        return res.status(400).json({error: "No se ha proporcionado el id del viaje"})
    }
    try {
        //Buscamos los viajes del usuario en la base de datos
        const snapshot = await viajesRef.orderByChild("email").equalTo(email).once("value");
        let viajes = undefined
        if (snapshot.exists()) {
            viajes = snapshot.val();
        }
        
        if(!viajes)
            return res.status(500).json({error: "Error del servidor"})
        let viaje = Object.entries(viajes).find(([key, v]) => key === id && Object.keys(v).length !== 0);
        if (!viaje)
            return res.status(404).json({ error: "El viaje no existe" });
        
        //Por el contrario si se encuentra, devolvemos los datos del viaje
        return res.json(viaje[1]);
    } catch (error) {
        console.error("Error al obtener el viaje:", error);
        //Si hubo un error en el servidor, se devuelve un error 500
        return res.status(500).json({ error: "Error interno del servidor" });
    }
})

routerViajes.get("/",async(req,res)=>{
    let email=req.infoApiKey.email
    try {
        const snapshot = await viajesRef.orderByChild("email").equalTo(email).once("value");
        let viajes = undefined
        if (snapshot.exists()) {
            viajes = snapshot.val();
        }
        return res.json(viajes);
    } catch (error) {
        console.error("Error al obtener el viaje:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
})

export default routerViajes