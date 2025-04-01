import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import database from '../backend/database.js';
const { viajesRef } = database;

const app = express();
app.use(express.json());
let isUserExistent = true;

// Mock del middleware de API keys
app.use('/viajes', (req, res, next) => {
    if (isUserExistent)
        req.infoApiKey = { email: 'test1234@ejemplo.com' };
    else
        req.infoApiKey = { email: null };
    next();
});

describe('GET /viajes/:id', () => {
    isUserExistent = true;
    it('debe devolver 400 si falta el id', async () => {
        // Simulación de la solicitud sin el id en la ruta

        const response = await request(app)
            .get('/viajes/') // Sin ID en la ruta
            .send();
    
        // Verificamos que la respuesta tenga el status 400
        expect(response.status).toBe(400);
        // Verificamos que el mensaje de error sea el esperado
        expect(response.body).toHaveProperty('error', 'No se ha proporcionado el id del viaje');
    });

    it('debe devolver 500 si snapshot no devuelve mail existente', async () => {
        // Simulación de la solicitud sin el id en la ruta
        const originalOnce = viajesRef.once;
        viajesRef.once = jest.fn(() => {
            throw new Error('Error simulado en BD');
        });

        const response = await request(app)
            .get('/viajes/idExistente')
            .send();
        
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Error interno del servidor');

        // Restaurar implementación original
        viajesRef.once = originalOnce;
    });
    
    it('should return 404 since the trip does not exist', async () => {
           // Simulación de la solicitud sin el id en la ruta
        const id = 'Idexistente';

        const response = await request(app)
            .get('/viaje/idInexistente') // Simulación de autenticación
            .send();
            
    
        // Verificamos que la respuesta tenga el status 400
        expect(response.status).toBe(404);
        // Verificamos que el mensaje de error sea el esperado
        expect(response.body).toHaveProperty('error', 'El mail proporcionado no existe en la bd por tanto error en el server');
     });
    

});
