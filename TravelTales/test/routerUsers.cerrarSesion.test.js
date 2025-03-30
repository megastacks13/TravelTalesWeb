import request from 'supertest';
import { describe, it, expect, jest, afterEach } from '@jest/globals';
import express from 'express';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
import activeApiKeys from '../backend/activeApiKeys.js';

const app = express();
app.use(express.json());
app.use('/users', routerUsers);

describe('POST /disconnect', () => {

    it('debe devolver 400 si no hay apiKey', async () => {
        const response = await request(app)
            .post('/users/disconnect')
            .query({}); // Sin apiKey

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Falta la apiKey');
    });

    it('debe devolver 400 si no existe esa apiKey', async () => {
        const response = await request(app)
            .post('/users/disconnect')
            .query({ apiKey: 'apiKey2' }); // La apiKey no existe

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('apiKey no registrada en el servidor');
    });

    it('debe eliminar la apiKey', async () => {

        activeApiKeys.push('apiKey1'); // Para que exista la apiKey

        const response = await request(app)
            .post('/users/disconnect')
            .query({ apiKey: 'apiKey1' }); // apiKey existente

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('ApiKey eliminada');
        expect(activeApiKeys).not.toContain('apiKey1'); // Comprueba que se ha eliminado
    });
});
