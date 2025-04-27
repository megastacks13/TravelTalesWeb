import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import database from '../backend/database.js';
const { viajesRef, entradasRef } = database;

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
    beforeEach(() => {
        // Limpiar mocks antes de cada test
        jest.clearAllMocks();
    });

    it('Debería añadir una entrada de blog correctamente (200)', async () => {
        // Datos directamente en la prueba
        const res = await request(app)
            .post('/viajes/123/anadirEntrada') // idViaje directamente en la URL
            .send({
                fecha: '2025-06-15',  // fecha proporcionada directamente
                contenido: 'Contenido de la entrada del blog'  // contenido proporcionado directamente
            });

        // Verificaciones
        expect(res.status).toBe(200);
        expect(res.body.mensaje).toBe('Se ha añadido la entrada.');
        expect(res.body.idEntrada).toBe('nuevaEntradaId');
    });

    it('Debería devolver error 400 si faltan parámetros (idViaje, fecha o contenido)', async () => {
        // Datos directamente en la prueba pero con un parámetro faltante
        const res = await request(app)
            .post('/viajes/123/anadirEntrada') // idViaje directamente en la URL
            .send({
                contenido: 'Esto es un contenido de prueba'  // Falta la fecha
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('No se ha recibido una fecha');
    });

    it('Debería devolver error 404 si no se encuentra el viaje', async () => {
        // Simulamos que no se encuentra el viaje
        mockViajesRef.child.mockReturnValueOnce({
            once: jest.fn().mockResolvedValueOnce({
                exists: () => false,
            }),
        });

        // Datos directamente en la prueba
        const res = await request(app)
            .post('/viajes/123/anadirEntrada') // idViaje directamente en la URL
            .send({
                fecha: '2025-04-30',
                contenido: 'Esto es un contenido de prueba'
            });

        expect(res.status).toBe(404);
        //expect(res.body.error).toBe('No se encontró el viaje con el id proporcionado');
    });

    it('Debería devolver error 500 si ocurre un error en el servidor', async () => {
        // Simulamos un error en el servidor
        mockViajesRef.child.mockReturnValueOnce({
            once: jest.fn().mockRejectedValueOnce(new Error('Error interno del servidor')),
        });

        // Datos directamente en la prueba
        const res = await request(app)
            .post('/viajes/123/anadirEntrada') // idViaje directamente en la URL
            .send({
                fecha: '2025-04-30',
                contenido: 'Esto es un contenido de prueba'
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Ha ocurrido un error al crear la entrada del blog');
    });
});
