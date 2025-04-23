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

describe('POST /register', () => {
    it('should return 200 and insert a new user if data is valid', async () => {
        // Simulamos que el usuario no existe en la base de datos
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshot),
            }),
        });

        // Simulamos la creación de usuario
        const mockNewUserRef = {
            key: 'newUserId',
            set: jest.fn().mockResolvedValue(),
        };
        jest.spyOn(usersRef, 'push').mockReturnValue(mockNewUserRef);

        const res = await request(app)
            .post('/users/register')
            .send({ email: 'new@example.com', nombre: 'New User', apellidos: 'de la huerta', contrasena: 'securepass' });

        expect(res.status).toBe(200);
        expect(res.body.insertedUser).toEqual({ id: 'newUserId', email: 'new@example.com', nombre: 'New User', apellidos: 'de la huerta' });
    });
    
    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({});
        expect(res.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("No se ha recibido un email");
        expect(res.body.error).toContain("No se ha recibido una contraseña");
       
    });

    it('should return 405 if user already exists', async () => {
        // Simulamos que ya existe un usuario con ese email en la base de datos
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(true),
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshot),
            }),
        });

        const res = await request(app)
            .post('/users/register')
            .send({ email: 'existing@example.com', nombre: 'Existing User', apellidos:"Usuario esistente", contrasena: 'securepass' });

        expect(res.status).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.code)
        expect(res.body.error).toBe("Ya existe un usuario asignado al email introducido");
    });


    it('should return 402 if there is a problem inserting the user', async () => {
        // Simulamos un fallo en la inserción
        const mockSnapshot = {
            exists: jest.fn().mockReturnValue(false),
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshot),
            }),
        });

        jest.spyOn(usersRef, 'push').mockImplementation(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .post('/users/register')
            .send({ email: 'error@example.com', nombre: 'Error User', apellidos: 'de la huerta', contrasena: 'securepass' });

        expect(res.status).toBe(appErrors.OPERATION_FAILED_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.OPERATION_FAILED_ERROR.code);
        expect(res.body.error).toBe("Ha habido un error interno insertando el usuario");
    });
});
