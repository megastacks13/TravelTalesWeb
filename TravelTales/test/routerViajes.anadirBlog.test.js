import request from 'supertest';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';

// Mock completo de Firebase
const createMockRef = () => {
    const mock = {
        orderByChild: jest.fn().mockReturnThis(),
        equalTo: jest.fn().mockReturnThis(),
        once: jest.fn(),
        push: jest.fn().mockReturnThis(),
        set: jest.fn(),
        child: jest.fn().mockReturnThis(),
        update: jest.fn(),
        remove: jest.fn()
    };
    return mock;
};

const mockUsersRef = createMockRef();
const mockViajesRef = createMockRef();

jest.mock('../backend/database.js', () => ({
    db: {},
    usersRef: mockUsersRef,
    viajesRef: mockViajesRef
}));

// Importar después del mock
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());

let isUserExistent = true;
let isValidApiKey = true;

// Mock del middleware de API keys
app.use('/viajes', (req, res, next) => {
    if (!isValidApiKey) {
        return res.status(401).json({ error: "invalid apiKey" });
    }
    
    if (isUserExistent) {
        req.infoApiKey = { email: 'correo@correo.com' };
    } else {
        req.infoApiKey = { email: null };
    }
    next();
});

app.use('/viajes', routerViajes);

describe('POST /viajes/:id/anadirBlog', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        isUserExistent = true;
        isValidApiKey = true;
    });

    it('debería devolver 400 si falta idViaje', async () => {
        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=isValidApiKey') 
            .send();
        
        expect(response.status).toBe(400);
        expect(response.body.errors).toContain("No se ha recibido un id de viaje");
    });

    it('debería devolver 404 si no se encuentra el viaje', async () => {
        mockViajesRef.child.mockReturnThis();
        mockViajesRef.once.mockResolvedValueOnce({
            exists: () => false
        });

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send();
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe("No se encontró el viaje con el id proporcionado");
    });

    it('debería devolver 200 si se añade correctamente el blog', async () => {
        mockViajesRef.child.mockReturnThis();
        mockViajesRef.once.mockResolvedValueOnce({
            exists: () => true
        });
        mockViajesRef.update.mockResolvedValueOnce();

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send();
        
        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Se ha creado el blog del viaje.");
    });

    it('debería devolver 500 si ocurre un error inesperado', async () => {
        mockViajesRef.child.mockReturnThis();
        mockViajesRef.once.mockRejectedValueOnce(new Error("Error inesperado"));

        const response = await request(app)
            .post('/viajes/123/anadirBlog?apiKey=apiKey1')
            .send();
        
        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Ha ocurrido un error al crear el blog del viaje");
    });

});
