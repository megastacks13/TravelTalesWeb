import express from 'express'
import jwt from 'jsonwebtoken'
import database from '../database.js'
import activeApiKeys from '../activeApiKeys.js'
import { activarBlog } from '../services/blogService.js'

const routerViajes = express.Router()
const { db, usersRef, viajesRef } = database

//Para saltarse la auten mientras programo.
const skipAuth = process.env.SKIP_AUTH === 'true'





// Middleware de autenticación
routerViajes.use((req, res, next) => {

  if (skipAuth) return next();
  const apiKey = req.query.apiKey
  if (!apiKey) return res.status(405).json({ error: 'No apiKey' })

  let infoApiKey
  try {
    infoApiKey = jwt.verify(apiKey, 'secret')
  } catch {
    return res.status(405).json({ error: 'invalid apiKey' })
  }

  if (!infoApiKey || !activeApiKeys.includes(apiKey)) {
    return res.status(405).json({ error: 'invalid apiKey' })
  }

  req.infoApiKey = infoApiKey
  next()
})

/**
 * @swagger
 * /viajes/anadir:
 *   post:
 *     summary: Añadir un nuevo viaje
 *     description: Crea un viaje con los datos proporcionados.
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               fechaIni:
 *                 type: string
 *               fechaFin:
 *                 type: string
 *               num:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Viaje añadido correctamente
 *       400:
 *         description: Datos inválidos
 */


/**
 * POST /viajes/anadir
 * Crea un nuevo viaje con sus campos y flags iniciales (planificacion, blog)
 */
routerViajes.post('/anadir', async (req, res) => {
  const { nombre, ubicacion, fechaIni, fechaFin, num } = req.body
  const errors = []
  if (!db) errors.push('Database error')
  if (!nombre) errors.push('Falta nombre')
  if (!ubicacion) errors.push('Falta ubicación')
  if (!fechaIni) errors.push('Falta fecha de inicio')
  if (!fechaFin) errors.push('Falta fecha de fin')
  if (!num) errors.push('Falta número de personas')
  const email = req.infoApiKey?.email
  if (!email) errors.push('Usuario no autenticado')

  if (errors.length) return res.status(400).json({ errors })

  try {
    // Comprobaciones en BD y unicidad de nombre...
    const userSnap = await usersRef.orderByChild('email').equalTo(email).once('value')
    if (!userSnap.exists()) return res.status(401).json({ error: 'Usuario no existe' })

    const viajesSnap = await viajesRef.orderByChild('email').equalTo(email).once('value')
    if (viajesSnap.exists()) {
      const duplicado = Object.values(viajesSnap.val()).some(v => v.nombre === nombre)
      if (duplicado) return res.status(409).json({ error: 'Viaje duplicado' })
    }

    // Inserción con flags iniciales
    const newRef = viajesRef.push()
    await newRef.set({ nombre, ubicacion, fechaIni, fechaFin, num, email, planificacion: false, blog: false })
    return res.json({ viajeAnadido: { id: newRef.key, nombre, ubicacion, fechaIni, fechaFin, num, email, planificacion: false, blog: false } })
  } catch (e) {
    console.error('Error al añadir viaje:', e)
    return res.status(500).json({ error: 'Error interno al añadir viaje', detalle: e.message })
  }
})

/**
 * GET /viajes/:id
 * Obtiene un viaje concreto
 */
/**
 * @swagger
 * /viajes/{id}:
 *   get:
 *     summary: Obtener información de un viaje específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del viaje
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del viaje
 */
routerViajes.get('/:id', async (req, res) => {
  const id = req.params.id
  const email = req.infoApiKey.email
  if (!id) return res.status(400).json({ error: 'Falta id de viaje' })

  try {
    const snap = await viajesRef.orderByChild('email').equalTo(email).once('value')
    const viajes = snap.exists() ? snap.val() : null
    if (!viajes) return res.status(404).json({ error: 'No hay viajes para este usuario' })

    const viaje = Object.entries(viajes).find(([key, v]) => key === id)?.[1]
    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' })

    return res.json(viaje)
  } catch (e) {
    console.error('Error al obtener viaje:', e)
    return res.status(500).json({ error: 'Error interno al obtener viaje', detalle: e.message })
  }
})

/**
 * GET /viajes
 * Lista todos los viajes del usuario
 */
routerViajes.get('/', async (req, res) => {
  const email = req.infoApiKey.email
  try {
    const snap = await viajesRef.orderByChild('email').equalTo(email).once('value')
    return res.json(snap.exists() ? snap.val() : {})
  } catch (e) {
    console.error('Error al listar viajes:', e)
    return res.status(500).json({ error: 'Error interno al listar viajes', detalle: e.message })
  }
})
  

/**
 * POST /viajes/:id/anadirPlanificacion
 * Activa la planificación de un viaje
 */
/**
 * @swagger
 * /viajes/{id}/anadirPlanificacion:
 *   post:
 *     summary: Activar la planificación para un viaje
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Planificación activada
 */

routerViajes.post('/:id/anadirPlanificacion', async (req, res) => {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: 'Falta id de viaje' })

  try {
    const snap = await viajesRef.child(id).once('value')
    if (!snap.exists()) return res.status(404).json({ error: 'Viaje no encontrado' })

    await viajesRef.child(id).update({ planificacion: true })
    return res.json({ mensaje: 'Se ha creado la planificación del viaje.' })
  } catch (e) {
    console.error('Error al crear planificación:', e)
    return res.status(500).json({ error: 'Error interno al crear planificación', detalle: e.message })
  }
})

/**
 * POST /viajes/:id/anadirBlog
 * Activa el blog de un viaje
 */
/**
 * @swagger
 * /viajes/{id}/anadirBlog:
 *   post:
 *     summary: Activar el blog para un viaje
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog activado para el viaje
 */

routerViajes.post('/:id/anadirBlog', async (req, res) => {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: 'Falta id de viaje' })

  try {
    const snap = await viajesRef.child(id).once('value')
    if (!snap.exists()) return res.status(404).json({ error: 'Viaje no encontrado' })

    const resultado = await activarBlog(id, viajesRef)
    return res.json(resultado)
  } catch (e) {
    console.error('Error al crear blog:', e)
    return res.status(500).json({ error: 'Error interno al crear blog', detalle: e.message })
  }
})

export default routerViajes
