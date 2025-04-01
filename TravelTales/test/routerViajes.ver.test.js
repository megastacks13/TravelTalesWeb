import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());

let isUserExistent = true;

// Mock del middleware de API keys
app.use('/viajes', (req, res, next) => {
    if (isUserExistent)
        req.infoApiKey = { email: 'test@ejemplo.com' };
    else
        req.infoApiKey = { email: null };
    next();
});

app.use('/viajes', routerViajes);

describe('GET /viajes/:id', () => {
    isUserExistent = true;
    // Test de casos 200 ------------------------------------------------------------
    //Test 200 pasa
    it('should return 200 and the trip data if the trip exists', async () => {
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                "userID123": { email: "test@ejemplo.com" }
            })
        };
    
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });
    
        // Simulamos la base de datos para el viaje, indicando que el viaje ya existe
        const mockSnapshotViaje = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                nombre: "Vacaciones",
                ubicacion: "Barcelona",
                fechaIni: "2025-09-01",
                fechaFin: "2025-09-03",
                num: 9,
                email: "test@ejemplo.com"
            })
        };
    
        jest.spyOn(viajesRef, 'child').mockReturnValue({
            once: jest.fn().mockResolvedValue(mockSnapshotViaje),
        });
    
        // Enviamos la solicitud POST para agregar un viaje
        const res = await request(app)
            .post('/viajes/anadir')
            .send({
                nombre: "Vacaciones",
                ubicacion: "Barcelona",
                fechaIni: "2025-09-01",
                fechaFin: "2025-09-03",
                num: 9,
                email: "test@ejemplo.com"
            });
    
        // Verificamos el código de estado y la respuesta
        expect(res.status).toBe(200);
        
        // Verificamos la estructura de los datos del viaje devueltos
        let viajeAnadido = res.body.viajeAnadido;
        
        // Comprobamos que el campo `id` se haya eliminado correctamente
        let tieneId = delete viajeAnadido['id'];
        expect(tieneId).toBe(true);
    
        // Verificamos que los datos del viaje sean correctos
        expect(viajeAnadido).toEqual({
            nombre: "Vacaciones",
            ubicacion: "Barcelona",
            fechaIni: "2025-09-01",
            fechaFin: "2025-09-03",
            num: 9,
            email: "test@ejemplo.com"
        });
    });

   // Test de casos 400 ------------------------------------------------------------
   /*
   it('should return 400 since the information is missing', async () => {
        const res = await request(app)
            .post('/viajes/')
            .send({}); // Enviamos un cuerpo vacío

        // Verificamos que el código de estado sea 400
        expect(res.status).toBe(400);

        // Verificamos que los errores en el cuerpo de la respuesta contengan los mensajes correctos
        expect(res.body.errors).toContain("No se ha recibido un nombre");
        expect(res.body.errors).toContain("No se ha recibido una ubicación");
        expect(res.body.errors).toContain("No se han recibido una fecha de inicio");
        expect(res.body.errors).toContain("No se ha recibido una fecha de finalización");
        expect(res.body.errors).toContain("No se ha recibido un número de personas");
        expect(res.body.errors).toContain("No se ha recibido el correo del usuario");
    });

    it('should return 400 since the ID is invalid', async () => {
        const res = await request(app)
            .get('/viajes/invalid-id')
            .send();

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("El ID proporcionado no es válido");
    });

    // Test de casos 401 ------------------------------------------------------------

    it('should return 401 since the user does not exist', async () => {
        isUserExistent = false;

        const res = await request(app)
            .get('/viajes/valid-id')
            .send();

        expect(res.status).toBe(401);
        expect(res.body.error).toContain("No existe un usuario con ese correo");
    });

    it('should return 401 since the user does not have permission to access the trip', async () => {
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({ "userID123": { email: "otheremail@correo.com" } })
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });

        const res = await request(app)
            .get('/viajes/valid-id')
            .send();

        expect(res.status).toBe(401);
        expect(res.body.error).toContain("El usuario no tiene acceso a este viaje");
    });
*/
    // Test de casos 404 ------------------------------------------------------------
    //
    it('should return 404 since the trip does not exist or cannot be added', async () => {
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                "userID123": { email: "test@ejemplo.com" }
            })
        };
    
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });
    
        // Simulamos que no se puede agregar el viaje o no existe
        const mockSnapshotViaje = {
            exists: jest.fn().mockReturnValue(false)
        };
    
        jest.spyOn(viajesRef, 'child').mockReturnValue({
            once: jest.fn().mockResolvedValue(mockSnapshotViaje),
        });
    
        // Realizamos el POST para agregar el viaje
        const res = await request(app)
            .post('/viajes/anadir')
            .send({
                nombre: "Vacaciones",
                ubicacion: "Barcelona",
                fechaIni: "2025-09-01",
                fechaFin: "2025-09-03",
                num: 9,
                email: "test@ejemplo.com"
            });
    
        // Esperamos que nos devuelvan el error 404 porque el viaje no existe o no se puede añadir
        expect(res.status).toBe(404);
        expect(res.body.error).toContain("El viaje no pudo ser agregado o no existe");
    });
});
