import express from 'express'
let routerViajes = express.Router()
import database from "../database.js";
const { db, usersRef, viajesRef, entradasRef } = database;
import jwt from 'jsonwebtoken'
import activeApiKeys from '../activeApiKeys.js'
import appErrors from '../errors.js';
import { activarBlog } from '../services/blogService.js'


routerViajes.use((req,res,next)=>{
    let apiKey = req.query.apiKey
    
    if(apiKey==undefined)
        return appErrors.throwError(res, appErrors.API_NOT_FOUND_ERROR, "No apiKey")

    let infoApiKey=null
    try{
        infoApiKey=jwt.verify(apiKey,"secret")
    }catch{
        return appErrors.throwError(res, appErrors.API_NOT_FOUND_ERROR, "Invalid apiKey")
    }
    

    if(infoApiKey==undefined||activeApiKeys.indexOf(apiKey)==-1)
        return appErrors.throwError(res, appErrors.API_NOT_FOUND_ERROR, "Invalid apiKey")

    req.infoApiKey=infoApiKey
    next()
})

//Ruta POST para añadir un viaje nuevo
routerViajes.post("/anadir", async (req, res) => {
    const { nombre, ubicacion, fechaIni, fechaFin, num } = req.body;
    let errors = [];
    
    //Comprobamos si hay errores en la base de datos
    if (!db) errors.push('Database error')
    
    //Comprobamos que se han recibido todos los campos necesarios
    if (!nombre) errors.push("No se ha recibido un nombre")
    if (!ubicacion) errors.push("No se ha recibido una ubicación")
    if (!fechaIni) errors.push("No se han recibido una fecha de inicio")
    if (!fechaFin) errors.push("No se han recibido una fecha de finalización")
    if (!num) errors.push("No se ha recibido un número de personas")
    let email = req.infoApiKey?.email ?? null
    if (email == null) errors.push("No se ha recibido el correo del usuario")

    // Enviamos los errores por el momento para evitar re-comprobaciones ded datos
    if (errors.length > 0) return appErrors.throwError(res, appErrors.MISSING_ARGUMENT_ERROR, errors)

    //Expresión para convertir la fecha en un objeto de tipo DATE
    const fechaRegex =/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    //Comprobamos la validez de las fechas de inicio y fin
    if (fechaIni && !fechaRegex.test(fechaIni)) errors.push("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.")
    if (fechaFin && !fechaRegex.test(fechaFin)) errors.push("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.")

    //Validación de que la fecha de fin es posterior a la de inicio
    try {
        const fechaInicioDate = parseFecha(fechaIni)
        const fechaFinDate = parseFecha(fechaFin)

        if (fechaFinDate <= fechaInicioDate)
            errors.push("La fecha de finalización debe ser posterior a la fecha de inicio")
        
    } catch (error) {
        errors.push(error.message);
    }
    
    //Validación de que el número de personas debe ser un entero mayor o igual a 1
    if (!Number.isInteger(Number(num)) || Number(num) < 1) {
        errors.push("El número de personas debe ser un número entero mayor o igual a 1")
    }

    const ubicacionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s.,/-]{2,}$/

    //Validación de la correcta ubicación (debe seguir el patrón mencionado)
    if (ubicacion && !ubicacionRegex.test(ubicacion))
        errors.push("La ubicación debe comenzar con una letra, tener al menos 3 caracteres y solo contener letras, números y caracteres especiales (.,/ -).")

    // Enviamos los errores
    if (errors.length > 0) return appErrors.throwError(res, appErrors.INVALID_ARGUMENT_ERROR, errors)

    //En otro caso intentamos guaradar el nuevo viaje
    try {
        //Verificamos si el usuario existe
        const snapshot2 = await usersRef.orderByChild("email").equalTo(email).once("value")
        if (!snapshot2.exists()) {
            return appErrors.throwError(res, appErrors.DATA_NOT_FOUND_ERROR, "No se ha encontrado usuario con ese id")
        }else{
            const snapshot = await viajesRef.orderByChild("email").equalTo(email).once("value")
            if (snapshot.exists()) {
                const viajes = snapshot.val();
                const viajeConMismoNombre = Object.values(viajes).find(viaje => viaje.nombre === nombre)
        
                if (viajeConMismoNombre) {
                    return appErrors.throwError(res, appErrors.UNIQUE_KEY_VIOLATION_ERROR, "Ya has creado un viaje con el mismo nombre")
                }
            }
        }   

        let blog=false
        const newViajeRef = viajesRef.push();
        await newViajeRef.set({ nombre, ubicacion, fechaIni, fechaFin, num, email, blog });

        //Devolvemos el viaje que acabamos de añadir con su ID generado automáticamente
        res.json({ viajeAnadido: { id: newViajeRef.key, nombre, ubicacion, fechaIni, fechaFin, num, email, blog } })
    } catch {
        //Devolvemos el error adecuado si hubo algún problema al insertar el viaje
        return appErrors.throwError(res, appErrors.UNIQUE_KEY_VIOLATION_ERROR, "Ha habido un error insertando el viaje")
    }
});

//Ruta GET para obtener un viaje específico por su ID
routerViajes.get("/:id",async(req,res)=>{
    const id = req.params.id
    let email=req.infoApiKey.email
    
    try {
        //Buscamos los viajes del usuario en la base de datos
        const snapshot = await viajesRef.orderByChild("email").equalTo(email).once("value");
        let viajes = undefined
        if (snapshot.exists()) {
            viajes = snapshot.val();
        }
        
        if(!viajes)
            return appErrors.throwError(res, appErrors.INTERNAL_SERVER_ERROR)
        let viaje = Object.entries(viajes).find(([key, v]) => key === id && Object.keys(v).length !== 0);
        if (!viaje)
            return appErrors.throwError(res, appErrors.DATA_NOT_FOUND_ERROR, "No se ha encontrado viaje con ese id")
        
        //Por el contrario si se encuentra, devolvemos los datos del viaje
        return res.json(viaje[1]);
    } catch (error) {
        console.error("Error al obtener el viaje:", error);
        //Si hubo un error en el servidor, se devuelve un error 500
        return appErrors.throwError(res, appErrors.INTERNAL_SERVER_ERROR)
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


routerViajes.post("/:id/anadirEntrada", async (req, res) => {
    const idViaje = req.params.id
    let fecha = req.body.fecha
    let contenido = req.body.contenido

    let errors = []
    if (!db) errors.push('Database error')
    if (!idViaje) errors.push("No se ha recibido un id de viaje")
    if(!fecha) errors.push("No se ha recibido una fecha")
    if(!contenido) errors.push("No se ha recibido contenido")
    
    const fechaRegex =/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

    if (fecha && !fechaRegex.test(fecha)) errors.push("La fecha no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.")
 

    if (errors.length > 0) return appErrors.throwError(res, appErrors.INVALID_ARGUMENT_ERROR, errors)

    try {
        const snapshot = await viajesRef.child(idViaje).once("value")
    
        if (!snapshot.exists()) {
            return appErrors.throwError(res, appErrors.DATA_NOT_FOUND_ERROR, errors)
        }

        let viaje = snapshot.val()
        const fechaIni = parseFecha(viaje.fechaIni)
        const fechaFin = parseFecha(viaje.fechaFin)
        let fechaDate = parseFecha(fecha)

        if (fechaDate < fechaIni || fechaDate > fechaFin)
            return appErrors.throwError(res, appErrors.INVALID_ARGUMENT_ERROR, errors)

        const newEntradaRef = entradasRef.push()
        await newEntradaRef.set({ fecha,contenido })

        const nuevaEntradaId = newEntradaRef.key

        const viajeSnapshot = await viajesRef.child(idViaje).once("value")

        viaje = viajeSnapshot.val()

        let blogActual = viaje.blog

        if (blogActual === true || !Array.isArray(blogActual)) blogActual = [nuevaEntradaId]
        else blogActual.push(nuevaEntradaId)

        await viajesRef.child(idViaje).update({ blog: blogActual })

        res.json({ mensaje: "Se ha añadido la entrada.", idEntrada: nuevaEntradaId })

    
    } catch (error) {
        return appErrors.throwError(res, appErrors.INTERNAL_SERVER_ERROR, error)
    }
});

const parseFecha = (fecha) => {
    const [año, mes, dia] = fecha.split('-').map(Number)
    
    const fechaDate = new Date(año, mes - 1, dia)

    if (fechaDate.getFullYear() !== año || fechaDate.getMonth() !== mes - 1 || fechaDate.getDate() !== dia) {
        throw new Error("La fecha no es válida, el día no corresponde al mes.")
    }

    return fechaDate;
};

routerViajes.post('/:id/anadirBlog', async (req, res) => {
  const idViaje = req.params.id
  if (!idViaje) return appErrors.throwError(res, appErrors.INVALID_ARGUMENT_ERROR);

  try {
    const snap = await viajesRef.child(idViaje).once('value')
    if (!snap.exists()) return appErrors.throwError(res, appErrors.DATA_NOT_FOUND_ERROR)

    await viajesRef.child(idViaje).update({ blog: true });
    res.json({ mensaje: "Se ha creado el blog del viaje." });

  } catch (e) {
    return appErrors.throwError(res, appErrors.INTERNAL_SERVER_ERROR, e)
  }
})


routerViajes.get('/:id/buscar', async (req, res) => {
  const { ubicacion } = req.query;
  const email = req.infoApiKey?.email;

  if (!ubicacion) {
    return res.status(400).json({ error: 'Falta la ubicación' });
  }

  try {
    const snap = await viajesRef
      .orderByChild('ubicacion')
      .equalTo(ubicacion)
      .once('value');

    const resultados = snap.exists() ? snap.val() : {};

    return res.json(resultados);
  } catch (e) {
    console.error('Error buscando viajes:', e);
    return res.status(500).json({ error: 'Error interno al buscar viajes' });
  }
});



export default routerViajes
