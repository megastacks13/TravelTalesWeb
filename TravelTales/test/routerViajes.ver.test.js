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
        req.infoApiKey = { email: 'correo@correo.com' };
    else
        req.infoApiKey = { email: null };
    next();
});

app.use('/viajes', routerViajes);

describe('GET /viajes/:id', () => {
    isUserExistent = true;

    // Test de casos 200 ------------------------------------------------------------

    it('should return 200 and the trip data if the trip exists', async () => {
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                "userID123": { email: "correo@correo.com" }
            })
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });

        const mockSnapshotViaje = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                nombre: "Viaje Testarudo",
                ubicacion: "Las Antípodas",
                fechaIni: "2001-09-01",
                fechaFin: "2001-09-03",
                num: 9,
                email: "correo@correo.com"
            })
        };
        jest.spyOn(viajesRef, 'child').mockReturnValue({
            once: jest.fn().mockResolvedValue(mockSnapshotViaje),
        });

        const res = await request(app)
            .get('/viajes/valid-id')
            .send();

        expect(res.status).toBe(200);
        expect(res.body.viaje).toEqual({
            nombre: "Viaje Testarudo",
            ubicacion: "Las Antípodas",
            fechaIni: "2001-09-01",
            fechaFin: "2001-09-03",
            num: 9,
            email: "correo@correo.com"
        });
    });

   /* // Test de casos 400 ------------------------------------------------------------

    it('should return 400 since the ID is not provided', async () => {
        const res = await request(app)
            .get('/viajes/')
            .send();

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("No se ha proporcionado un ID de viaje");
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

    // Test de casos 404 ------------------------------------------------------------

    it('should return 404 since the trip does not exist', async () => {
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                "userID123": { email: "correo@correo.com" }
            })
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });

        const mockSnapshotViaje = {
            exists: jest.fn().mockReturnValue(false)
        };
        jest.spyOn(viajesRef, 'child').mockReturnValue({
            once: jest.fn().mockResolvedValue(mockSnapshotViaje),
        });

        const res = await request(app)
            .get('/viajes/valid-id')
            .send();

        expect(res.status).toBe(404);
        expect(res.body.error).toContain("El viaje no existe");
    });*/
});
