import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;
import appErrors from '../backend/errors.js';

const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);
app.use('/users', routerUsers);

describe('POST /viajes/:id/anadirBlog', () => {
  const newUser = {
    nombre: 'Tester Blog',
    apellidos: 'Apellido Blog',
    email: 'testing2Blog@example.com',
    contrasena: 'Pwvalida1_'
  };

  const newTrip = {
    nombre: 'Viaje con blog',
    ubicacion: 'Testlandia',
    fechaIni: '2025-01-01',
    fechaFin: '2025-12-31',
    num: 2
  };

  let apiKey, viajeId, userKey;
  
  //Test para comprobar la correcta adición de un viaje 
    //Codigo 200 (se añade correctamente)
    it('debe añadir un viaje con datos válidos', async () => {
        const registerResponse = await request(app)
          .post('/users/register')
          .send(newUser);

          expect(registerResponse.status).toBe(200)

        const loginResponse = await request(app)
            .post('/users/login')
            .send({email:newUser.email, contrasena:newUser.contrasena})

          expect(loginResponse.status).toBe(200)
          
        apiKey = loginResponse.body.apiKey

        userKey = loginResponse.body.id;

        const viaje = await request(app)
            .post('/viajes/anadir?apiKey=' + apiKey)
            .send(newTrip);
        expect(viaje.status).toBe(200);
        viajeId = viaje.body.viajeAnadido.id;

        const response = await request(app)
        .post(`/viajes/${viajeId}/anadirBlog?apiKey=`+apiKey)
        .send({});

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Se ha creado el blog del viaje.");

        await usersRef.child(userKey).remove();
        await viajesRef.child(viajeId).remove();
    });

    it('Error 404: id de viaje no existente', async () => {
    const registerResponse = await request(app)
          .post('/users/register')
          .send(newUser);
    
        expect(registerResponse.status).toBe(200)
    
    const loginResponse = await request(app)
          .post('/users/login')
          .send({email:newUser.email, contrasena:newUser.contrasena})
    
        expect(loginResponse.status).toBe(200)
          
    apiKey = loginResponse.body.apiKey

    userKey = loginResponse.body.id;

    const viaje = await request(app)
       .post('/viajes/anadir?apiKey=' + apiKey)
        .send(newTrip);
      expect(viaje.status).toBe(200);
    viajeId = viaje.body.viajeAnadido.id;

    const response = await request(app)
        .post('/viajes/fakeId123/anadirBlog?apiKey=' + apiKey)
        .send({});
      
        await usersRef.child(userKey).remove();
        await viajesRef.child(viajeId).remove();  
      console.log('response Status', response.status);
      console.log('response body code', response.body.code)  
      expect(response.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
      expect(response.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);

      
    
  });

});
