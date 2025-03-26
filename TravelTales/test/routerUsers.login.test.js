import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef } = database;


const app = express();
app.use(express.json());
app.use('/users', routerUsers);

describe('POST /login', () => {
    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("No se ha recibido un email");
        expect(res.body.errors).toContain("No se ha recibido una contraseña");
        
    });

    it('should return 401 if the email does not exists', async () => {

        const res = await request(app)
            .post('/users/login')
            .send({ email: 'nonexisting@example.com', contrasena: 'securepass' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Correo no válido");
    });

    it('should return 402 if the password is incorrect', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ email: 'prueba2@gmail.com', contrasena: 'securepass' });

        expect(res.status).toBe(402);
        expect(res.body.error).toBe("Contraseña incorrecta");
    });
});
