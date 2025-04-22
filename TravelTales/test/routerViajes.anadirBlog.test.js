import request from 'supertest';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';

// Mock de Firebase
const createMockRef = () => {
    return {
        once: jest.fn().mockResolvedValue({ exists: () => false }), // Por defecto, no existe el viaje
        update: jest.fn().mockResolvedValue(null),
        child: jest.fn().mockReturnThis(),
    };
};

const mockViajesRef = createMockRef();

jest.mock('../backend/database.js', () => ({
    db: {},
    viajesRef: mockViajesRef,
}));

// Configuración de la app con el router
const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);

describe('POST /viajes/:id/anadirBlog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Código 200: Éxito al crear un blog
    it('should return 200 since the blog was added successfully', async () => {
        mockViajesRef.once.mockResolvedValueOnce({ exists: () => true }); // Simular viaje existente

        const res = await request(app).post('/viajes/123/anadirBlog').send({ idViaje: "123" });

        expect(res.status).toBe(200);
        expect(res.body.mensaje).toBe("Se ha creado el blog del viaje.");
    });

    it('should return 400 since the idViaje is missing', async () => {
        const res = await request(app).post('/viajes/123/anadirBlog'); // No envía idViaje

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("No se ha recibido un id de viaje");
    });

    it('should return 404 since the trip with the given ID does not exist', async () => {
        mockViajesRef.once.mockResolvedValueOnce({ exists: () => false }); // Simular viaje inexistente

        const res = await request(app).post('/viajes/999/anadirBlog').send({ idViaje: "999" });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("No se encontró el viaje con el id proporcionado");
    });

    it('should return 500 since an error occurred when updating the trip', async () => {
        mockViajesRef.once.mockResolvedValueOnce({ exists: () => true });
        mockViajesRef.update.mockRejectedValueOnce(new Error("Simulación de error interno"));

        const res = await request(app).post('/viajes/123/anadirBlog').send({ idViaje: "123" });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Ha ocurrido un error al crear el blog del viaje");
        expect(res.body.detalle).toBe("Simulación de error interno");
    });
});
