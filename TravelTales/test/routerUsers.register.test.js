import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef } = database;


const app = express();
app.use(express.json());
app.use('/users', routerUsers);

describe('POST /register', () => {
    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("no email");
        expect(res.body.errors).toContain("no name");
        expect(res.body.errors).toContain("no password");
    });

    it('should return 400 if password is shorter than 5 characters', async () => {
        const res = await request(app)
            .post('/users/register')
            .send({ email: 'test@example.com', name: 'Test', password: '1234' });
        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("password shorter than 5");
    });

    it('should return 400 if user already exists', async () => {
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
            .send({ email: 'existing@example.com', name: 'Existing User', password: 'securepass' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("already user with that email");
    });

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
            .send({ email: 'new@example.com', name: 'New User', password: 'securepass' });

        expect(res.status).toBe(200);
        expect(res.body.insertedUser).toEqual({ id: 'newUserId', email: 'new@example.com', name: 'New User' });
    });

    it('should return 400 if there is a problem inserting the user', async () => {
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
            .send({ email: 'error@example.com', name: 'Error User', password: 'securepass' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("problem inserting the user");
    });
});
