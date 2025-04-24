import request from 'supertest';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import appErrors from '../backend/errors.js'
import activeApiKeys from '../backend/activeApiKeys.js';
import jwt from 'jsonwebtoken';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());

// Mock de activeApiKeys
const mockActiveApiKeys = [];

jest.spyOn(activeApiKeys, 'push').mockImplementation((key) => mockActiveApiKeys.push(key));
jest.spyOn(activeApiKeys, 'indexOf').mockImplementation((key) => mockActiveApiKeys.indexOf(key));
jest.spyOn(activeApiKeys, 'splice').mockImplementation((index, count) => mockActiveApiKeys.splice(index, count));

app.use('/viajes', routerViajes);

beforeEach(() => {
    mockActiveApiKeys.length = 0; // Limpia el array antes de cada prueba
    mockActiveApiKeys.push('apiKey1');
    jest.spyOn(jwt, 'verify').mockImplementation((key, secret) => {return {email: "correo@correo.com"}});
});

afterEach(() => {
    jest.resetAllMocks(); // Limpia todos los mocks al final de cada test
});

describe('GET /:id', () => {
    // Test de casos 404 ------------------------------------------------------------
    it('UNIT: should return 404 when trip does not exist for user', async () => {
        jest.spyOn(viajesRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({
                    exists: () => true,
                    val: () => ({
                        "otherTripId": {
                            nombre: "Otro viaje",
                            ubicacion: "Madrid",
                            fechaIni: "2023-02-01",
                            fechaFin: "2023-02-07",
                            num: 3,
                            email: "correo@correo.com"
                        }
                    })
                })
            })
        }));

        const res = await request(app)
            .get('/viajes/nonExistentId?apiKey=apiKey1');

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toContain("No se ha encontrado viaje con ese id");
    });

    it('UNIT: should return 404 when trip ID exists but is empty', async () => {
        // Mock para viajes del usuario
        jest.spyOn(viajesRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => true,
                    val: () => ({ 
                        "existingId": {} // Objeto vacío
                    }) 
                })
            })
        }));

        const res = await request(app)
            .get('/viajes/existingId?apiKey=apiKey1');

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toContain("No se ha encontrado viaje con ese id");
    });

    // Test de casos 200 ------------------------------------------------------------
    it('UNIT: should return 200 with trip data when trip exists', async () => {
        const mockTrip = {
            nombre: "Viaje de prueba",
            ubicacion: "Barcelona",
            fechaIni: "2023-01-01",
            fechaFin: "2023-01-07",
            num: 2,
            email: "correo@correo.com"
        };

        // Mock para viajes del usuario
        jest.spyOn(viajesRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => true,
                    val: () => ({ 
                        "existingTripId": mockTrip 
                    }) 
                })
            })
        }));

        const res = await request(app)
            .get('/viajes/existingTripId?apiKey=apiKey1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTrip);
    });
});