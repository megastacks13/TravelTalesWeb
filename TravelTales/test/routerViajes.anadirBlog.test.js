import request from 'supertest';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import appErrors from '../backend/errors.js';
import activeApiKeys from '../backend/activeApiKeys.js';
import jwt from 'jsonwebtoken';
import database from '../backend/database.js';

const app = express(); 
app.use(express.json());
app.use('/viajes', routerViajes); 

// Mock de activeApiKeys
const mockActiveApiKeys = [];

jest.spyOn(activeApiKeys, 'push').mockImplementation((key) => mockActiveApiKeys.push(key));
jest.spyOn(activeApiKeys, 'indexOf').mockImplementation((key) => mockActiveApiKeys.indexOf(key));
jest.spyOn(activeApiKeys, 'splice').mockImplementation((index, count) => mockActiveApiKeys.splice(index, count));

beforeEach(() => {
    mockActiveApiKeys.length = 0;
    mockActiveApiKeys.push('apiKey1');

    jest.spyOn(jwt, 'verify').mockImplementation((key, secret) => ({ email: 'correo@correo.com' }));
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('POST /:id/anadirBlog', () => {
    it('debería devolver 404 si no se encuentra el viaje', async () => {
        jest.spyOn(database.viajesRef, 'child').mockReturnValue({
            once: async () => ({
                exists: () => false
            })
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send();
        
        expect(response.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(response.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
    });

    it('debería devolver 200 si se añade correctamente el blog', async () => {
        jest.spyOn(database.viajesRef, 'child').mockReturnValue({
            once: async () => ({
                exists: () => true,
                val: () => ({ 
                    "viajeId123": { 
                        nombre: "Viaje Testarudo", 
                        ubicacion: "Las Antípodas", 
                        fechaIni: "2001-02-01", 
                        fechaFin: "2002-02-01", 
                        num: 9 
                    }  
                })
            }),
            update: jest.fn().mockResolvedValue()
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send();

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Se ha creado el blog del viaje.");
    });

    it('debería devolver 500 si ocurre un error inesperado', async () => {
       jest.spyOn(database.viajesRef, 'child').mockReturnValue({
            once: async () => ({
                exists: () => true,
                val: () => ({ 
                    "viajeId123": { 
                        nombre: "Viaje Testarudo", 
                        ubicacion: "Las Antípodas", 
                        fechaIni: "2001-02-01", 
                        fechaFin: "2002-02-01", 
                        num: 9 
                    }  
                })
            }),
            // Simulamos que algo va mal, por ejemplo no creamos el mock del metodo update()
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send();

        expect(response.status).toBe(appErrors.INTERNAL_SERVER_ERROR.httpStatus);
        expect(response.body.code).toBe(appErrors.INTERNAL_SERVER_ERROR.code);
    });
});
