// test/routerViajes.ver.test.js

import request from 'supertest';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import jwt from 'jsonwebtoken';

import routerViajes from '../backend/routers/routerViajes.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;
import appErrors from '../backend/errors.js';


jest.mock('../backend/activeApiKeys.js', () => {
    return {
        __esModule: true,
        default: ['mockedApiKey123']
    };
});

const app = express();
app.use(express.json());

beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        email: 'test@ejemplo.com'
    }));
});

app.use('/viajes', routerViajes);

describe('GET /viajes/:id', () => {
    const mockApiKey = 'mockedApiKey123';

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

        const res = await request(app)
            .post(`/viajes/anadir?apiKey=${mockApiKey}`)
            .send({
                nombre: "Vacaciones",
                ubicacion: "Barcelona",
                fechaIni: "2025-09-01",
                fechaFin: "2025-09-03",
                num: 9,
                email: "test@ejemplo.com"
            });

        expect(res.status).toBe(200);

        let viajeAnadido = res.body.viajeAnadido;
        let tieneId = delete viajeAnadido['id'];
        expect(tieneId).toBe(true);
        expect(viajeAnadido).toEqual({
            nombre: "Vacaciones",
            ubicacion: "Barcelona",
            fechaIni: "2025-09-01",
            fechaFin: "2025-09-03",
            num: 9,
            email: "test@ejemplo.com"
        });
    });

    it('should return 400 since the id is missing', async () => {
        const res = await request(app)
            .post(`/viajes/anadir?apiKey=${mockApiKey}`); // Falta el body

        expect(res.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);
        expect(res.body.error).toBe('No se ha proporcionado el id del viaje');
    });

    it('should return 401 if user not found', async () => {
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
        };

        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnThis(),
            once: jest.fn().mockResolvedValue(mockSnapshot),
        });

        const res = await request(app)
            .post(`/viajes/anadir?apiKey=${mockApiKey}`)
            .send({
                nombre: "Viaje Test",
                ubicacion: "Madrid",
                fechaIni: "2025-04-01",
                fechaFin: "2025-04-10",
                num: 2
            });

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toBe("No existe un usuario con ese correo");
    });

    it('should return 402 if insertion fails', async () => {
        jest.spyOn(viajesRef, 'push').mockReturnValue({
            set: jest.fn().mockImplementation(() => Promise.reject(new Error("Insert error"))),
            key: 'mockedKey'
        });

        const res = await request(app)
            .post(`/viajes/anadir?apiKey=${mockApiKey}`)
            .send({
                nombre: "Viaje Test",
                ubicacion: "Madrid",
                fechaIni: "2025-04-01",
                fechaFin: "2025-04-10",
                num: 2
            });

        expect(res.status).toBe(appErrors.OPERATION_FAILED_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.OPERATION_FAILED_ERROR.code);
        expect(res.body.error).toBe("Ha habido un error insertando el viaje");
    });

    it('should return 404 since the trip does not exist', async () => {
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

        const mockSnapshotViaje = {
            exists: jest.fn().mockReturnValue(false)
        };

        jest.spyOn(viajesRef, 'child').mockReturnValue({
            once: jest.fn().mockResolvedValue(mockSnapshotViaje),
        });

        const res = await request(app)
            .get(`/viajes/inexistente?apiKey=${mockApiKey}`)
            .send();

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toContain("El viaje no existe");
    });

    it('should return 500 if the server encounters an error', async () => {
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
            val: jest.fn().mockReturnValue(null),
        };

        jest.spyOn(viajesRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnThis(),
            once: jest.fn().mockResolvedValue(mockSnapshot),
        });

        const res = await request(app)
            .get(`/viajes/1234?apiKey=${mockApiKey}`)
            .send();

        expect(res.status).toBe(appErrors.INTERNAL_SERVER_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INTERNAL_SERVER_ERROR.code);
        expect(res.body.error).toBe("Error del servidor");
    });
});
