import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef } = database;
import appErrors from '../backend/errors.js'


const app = express();
app.use(express.json());
app.use('/users', routerUsers);

describe('POST /login', () => {
    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({});
        
        expect(res.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("No se ha recibido un email");
        expect(res.body.error).toContain("No se ha recibido una contraseña");
        
    });

    it('should return 401 if the email does not exists', async () => {
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshot),
            }),
        });
        const res = await request(app)
            .post('/users/login')
            .send({ email: 'nonexisting@example.com', contrasena: 'securepass' });

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toBe("Correo no registrado");
    });

    it('should return 402 if the password is incorrect', async () => {
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(true),
            forEach: jest.fn((callback) => {
                // Simula un snapshot con un único hijo con contraseña incorrecta
                callback({
                    key: 'usuarioId',
                    val: () => ({
                        email: 'prueba2@gmail.com',
                        contrasena: 'wrongpass', // Contraseña incorrecta
                    }),
                });
            }),
        };
    
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshot),
            }),
        });
    
        const res = await request(app)
            .post('/users/login')
            .send({ email: 'prueba2@gmail.com', contrasena: 'securepass' });
    
        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.error).toBe("Contraseña incorrecta");
    });
    
});
