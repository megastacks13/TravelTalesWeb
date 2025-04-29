// Mocks arriba del todo
const childMock = jest.fn();
jest.mock('../backend/database.js', () => {
    return {
        __esModule: true,
        default: {
            viajesRef: {
                child: childMock
            }
        }
    };
});

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

// Middleware simulado de API key + JWT
beforeEach(() => {
    mockActiveApiKeys.length = 0;
    mockActiveApiKeys.push('apiKey1');

    jest.spyOn(jwt, 'verify').mockImplementation(() => ({ email: 'correo@correo.com' }));
});

afterEach(() => {
    jest.resetAllMocks();
    childMock.mockReset(); 
});

describe('POST /:id/anadirBlog', () => {
    it('debería devolver 400 si falta idViaje en el body', async () => {
        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send({}); // Body vacío

        expect(response.status).toBe(400);
        expect(response.body.errors).toContain("No se ha recibido un id de viaje");
    });

    it('debería devolver 404 si no se encuentra el viaje', async () => {
        childMock.mockReturnValue({
            once: jest.fn().mockResolvedValueOnce({ exists: () => false })
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send({ idViaje: '123' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("No se encontró el viaje con el id proporcionado");
    });

    it('debería devolver 200 si se añade correctamente el blog', async () => {
        childMock.mockReturnValue({
            once: jest.fn().mockResolvedValueOnce({ exists: () => true }),
            update: jest.fn().mockResolvedValueOnce()
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send({ idViaje: '123' });

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Se ha creado el blog del viaje.");
    });

    it('debería devolver 500 si ocurre un error inesperado', async () => {
        childMock.mockReturnValue({
            once: jest.fn().mockRejectedValue(new Error("Error inesperado"))
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send({ idViaje: '123' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Ha ocurrido un error al crear el blog del viaje");
    });
});
