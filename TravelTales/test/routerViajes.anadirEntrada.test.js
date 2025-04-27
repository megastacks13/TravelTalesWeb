import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef, viajesRef, entradasRef } = database;
import appErrors from '../backend/errors.js';

// Crear mocks de Firebase
const createMockRef = () => {
    return {
        once: jest.fn(),
        push: jest.fn(),
        child: jest.fn().mockReturnThis(),
        update: jest.fn(),
        set: jest.fn(),
    };
};

// Mocks de Firebase
const mockViajesRef = createMockRef();
const mockEntradasRef = createMockRef();

// Mock de la base de datos
jest.mock('../backend/database.js', () => ({
    db: {},  // Simulamos que la base de datos está conectada
    viajesRef: mockViajesRef,
    entradasRef: mockEntradasRef,
}));

// Iniciar la app de Express
const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);

describe('POST /viajes/:id/anadirEntrada', () => {
    
    let validId = '123';
    let validFecha = '2025-04-30';
    let validContenido = 'Esto es un contenido de prueba';

    beforeEach(() => {
        // Limpiar mocks antes de cada test
        jest.clearAllMocks();
    });

    it('Debería añadir una entrada de blog correctamente (200)', async () => {
        // Mock de la respuesta de Firebase
        mockViajesRef.child.mockReturnValueOnce({
            once: jest.fn().mockResolvedValueOnce({
                exists: () => true,
                val: () => ({ fechaIni: '2025-01-01', fechaFin: '2025-12-31', blog: [] }),
            }),
        });

        mockEntradasRef.push.mockReturnValueOnce({
            set: jest.fn(),
            key: 'nuevaEntradaId',
        });

        // Simulación de la petición
        const res = await request(app)
            .post(`/viajes/${validId}/anadirEntrada`)
            .send({ fecha: validFecha, contenido: validContenido });

        expect(res.status).toBe(200);
        expect(res.body.mensaje).toBe('Se ha añadido la entrada.');
        expect(res.body.idEntrada).toBe('nuevaEntradaId');
    });

    it('Debería devolver error 400 si faltan parámetros (idViaje, fecha o contenido)', async () => {
        // Petición sin fecha
        const res = await request(app)
            .post(`/viajes/${validId}/anadirEntrada`)
            .send({ contenido: validContenido });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('No se ha recibido una fecha');
    });

    it('Debería devolver error 400 si la fecha tiene un formato incorrecto', async () => {
        const invalidFecha = '2025-04-31';  // Fecha inválida (día 31 no existe en abril)
        
        const res = await request(app)
            .post(`/viajes/${validId}/anadirEntrada`)
            .send({ fecha: invalidFecha, contenido: validContenido });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('La fecha no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.');
    });

    it('Debería devolver error 404 si no se encuentra el viaje', async () => {
        mockViajesRef.child.mockReturnValueOnce({
            once: jest.fn().mockResolvedValueOnce({
                exists: () => false,
            }),
        });

        const res = await request(app)
            .post(`/viajes/${validId}/anadirEntrada`)
            .send({ fecha: validFecha, contenido: validContenido });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('No se encontró el viaje con el id proporcionado');
    });

    it('Debería devolver error 500 si ocurre un error en el servidor', async () => {
        mockViajesRef.child.mockReturnValueOnce({
            once: jest.fn().mockRejectedValueOnce(new Error('Error interno del servidor')),
        });

        const res = await request(app)
            .post(`/viajes/${validId}/anadirEntrada`)
            .send({ fecha: validFecha, contenido: validContenido });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Ha ocurrido un error al crear la entrada del blog');
    });
});
