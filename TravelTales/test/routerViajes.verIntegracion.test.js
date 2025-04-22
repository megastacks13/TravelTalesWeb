import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import database from '../backend/database.js';
import routerViajes from '../backend/routers/routerViajes.js';
import routerUsers from '../backend/routers/routerUsers.js';
const { viajesRef, usersRef } = database;
import appErrors from '../backend/errors.js';

const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);
app.use('/users', routerUsers);

describe('GET /viajes/:id', () => {
    it('debe devolver error 404 si no se proporciona apiKey', async () => {
        const response = await request(app)
            .get('/viajes') // No mandamos apiKey
            .send();
    
        expect(response.status).toBe(appErrors.API_NOT_FOUND_ERROR.httpStatus);
        expect(response.body.code).toBe(appErrors.API_NOT_FOUND_ERROR.code);
    });
    

    it('debe devolver 200 si todo esta bien', async () => {
        const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"2001-01-01", fechaFin:"2002-02-02", num:9}
        
        const newUser = {
                nombre: 'UserDeMiIntergasion',
                apellidos: 'apellTestUser',
                email: 'test@example.com',
                contrasena: 'Pwvalida1_'
        };
        
        const registerResponse = await request(app)
            .post('/users/register')
            .send(newUser);
        
        expect(registerResponse.status).toBe(200)
    
        const loginResponse = await request(app)
            .post('/users/login')
            .send({email:newUser.email, contrasena:newUser.contrasena})
    
        expect(loginResponse.status).toBe(200)
            
        const apiKey = loginResponse.body.apiKey
    
        const responseAnadir = await request(app)
                    .post('/viajes/anadir?apiKey='+apiKey)
                    .send(newTrip)
    
        expect(responseAnadir.status).toBe(200)

        // Simulación de la solicitud sin el id en la ruta
        const originalOnce = viajesRef.once;
        viajesRef.once = jest.fn(() => {
            throw new Error('Error simulado en BD');
        });

        let url = `/viajes/${responseAnadir.body.viajeAnadido.id}?apiKey=${apiKey}`
        const response = await request(app)
            .get(url)
            .send();
        
        expect(response.status).toBe(200);

        // Restaurar implementación original
        viajesRef.once = originalOnce;

        // Limpieza de la bd
        const userKey = loginResponse.body.id
        await usersRef.child(userKey).remove(); 
        const tripKey = responseAnadir.body.viajeAnadido.id;
        await viajesRef.child(tripKey).remove();
    });
    
    it('debe devolver 404 si no se encuentra el viaje', async () => {        
        const newUser = {
                nombre: 'UserDeMiIntergasion',
                apellidos: 'apellTestUser',
                email: 'test@example.com',
                contrasena: 'Pwvalida1_'
        };
        
        const registerResponse = await request(app)
            .post('/users/register')
            .send(newUser);
        
        expect(registerResponse.status).toBe(200)
    
        const loginResponse = await request(app)
            .post('/users/login')
            .send({email:newUser.email, contrasena:newUser.contrasena})
    
        expect(loginResponse.status).toBe(200)
            
        const apiKey = loginResponse.body.apiKey


        // Simulación de la solicitud sin el id en la ruta
        const originalOnce = viajesRef.once;
        viajesRef.once = jest.fn(() => {
            throw new Error('Error simulado en BD');
        });

        let url = `/viajes/1233333333?apiKey=${apiKey}`
        const response = await request(app)
            .get(url)
            .send();
        
        expect(response.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(response.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(response.body.error).toBe("No se ha encontrado viaje con ese id");
        // Restaurar implementación original
        viajesRef.once = originalOnce;

        // Limpieza de la bd
        const userKey = loginResponse.body.id
        await usersRef.child(userKey).remove(); 
    });

});
