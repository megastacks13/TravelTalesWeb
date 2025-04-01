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
    //
    it('should return 400 since the id is missing', async () => {
        // Simulación de la solicitud sin el id en la ruta
        const response = await request(app)
            .post('/viajes/anadir') // Sin ID en la ruta
            .set('infoApiKey', JSON.stringify({ email: 'test@example.com' })) // Simulación de autenticación
    
        // Verificamos que la respuesta tenga el status 400
        expect(response.status).toBe(400);
        // Verificamos que el mensaje de error sea el esperado
        expect(response.body).toHaveProperty('error', 'No se ha proporcionado el id del viaje');
    });

    // Test de casos 401 ------------------------------------------------------------
    //Funciona
    it('should return 401 if user not found', async () => {
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
        };

        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnThis(),
            once: jest.fn().mockResolvedValue(mockSnapshot),
        });

        const res = await request(app).post('/viajes/anadir').send({
            nombre: "Viaje Test",
            ubicacion: "Madrid",
            fechaIni: "2025-04-01",
            fechaFin: "2025-04-10",
            num: 2
        });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("No existe un usuario con ese correo");
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
            .post('/viajes/valid-id') 
            .send();

        expect(res.status).toBe(401);
        expect(res.body.error).toContain("El usuario no tiene acceso a este viaje");
    });
    
    // Test de casos 402 ------------------------------------------------------------
    //Funciona
    it('should return 402 if insertion fails', async () => {
        // Simulamos el método push para que devuelva un objeto con el método set, que falla.
        jest.spyOn(viajesRef, 'push').mockReturnValue({
            set: jest.fn().mockImplementation(() => Promise.reject(new Error("Insert error"))),
            key: 'mockedKey' // Para evitar problemas de referencia
        });
    
        const res = await request(app).post('/viajes/anadir').send({
            nombre: "Viaje Test",
            ubicacion: "Madrid",
            fechaIni: "2025-04-01",
            fechaFin: "2025-04-10",
            num: 2
        });
    
        expect(res.status).toBe(402);
        expect(res.body.error).toBe("Ha habido un error insertando el viaje");
    });

    // Test de casos 404 ------------------------------------------------------------
    //Funciona
    it('should return 404 since the trip does not exist', async () => {
        // Simulamos que el usuario existe en la base de datos
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
    
        // Simulamos que el viaje no existe (snapshot.exists() retorna false)
        const mockSnapshotViaje = {
            exists: jest.fn().mockReturnValue(false)
        };
    
        jest.spyOn(viajesRef, 'child').mockReturnValue({
            once: jest.fn().mockResolvedValue(mockSnapshotViaje),
        });
    
        // Realizamos el GET para obtener el viaje
        const res = await request(app)
            .get('/viajes/inexistente') // Usamos un ID que no existe
            .send();
    
        // Verificamos que la respuesta sea 404
        expect(res.status).toBe(404);
    
        // Verificamos que el mensaje de error sea el esperado
        expect(res.body.error).toContain("El viaje no existe");
    });
    
    // Test de casos 500 ------------------------------------------------------------
    //Funciona
    it('should return 500 if the server encounters an error', async () => {
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
            val: jest.fn().mockReturnValue(null),
        };

        jest.spyOn(viajesRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnThis(),
            once: jest.fn().mockResolvedValue(mockSnapshot),
        });

        const res = await request(app).get('/viajes/1234');
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Error del servidor");
    });
});
