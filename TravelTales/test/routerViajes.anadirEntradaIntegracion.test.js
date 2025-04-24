import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef, viajesRef, entradasRef } = database;
import appErrors from '../backend/errors.js';

const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);
app.use('/users', routerUsers);

describe('POST /viajes/:id/anadirEntrada', () => {
  const newUser = {
    nombre: 'Tester Entrada',
    apellidos: 'Apellido Entrada',
    email: 'testingEntradas@example.com',
    contrasena: 'Pwvalida1_'
  };

  const newTrip = {
    nombre: 'Viaje con entradas',
    ubicacion: 'Testlandia',
    fechaIni: '2025-01-01',
    fechaFin: '2025-12-31',
    num: 2
  };

  let apiKey, viajeId, userKey;

  it('Error 400: faltan datos', async () => {
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
      .post(`/viajes/${viajeId}/anadirEntrada?apiKey=`+apiKey)
      .send({});

    expect(response.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
    expect(response.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
    expect(response.body.error).toContain("No se ha recibido una fecha");
    expect(response.body.error).toContain("No se ha recibido contenido");

    await usersRef.child(userKey).remove();
    await viajesRef.child(viajeId).remove();
  });

  it('Error 400: formato inválido de fecha', async () => {
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
      .post(`/viajes/${viajeId}/anadirEntrada?apiKey=`+apiKey)
      .send({ fecha: '01-01-2025', contenido: 'Contenido válido' });
    expect(response.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
    expect(response.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
    expect(response.body.error[0]).toContain("La fecha no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");

    await usersRef.child(userKey).remove();
    await viajesRef.child(viajeId).remove();
  });

  it('Error 400: fecha fuera del rango del viaje', async () => {
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
      .post(`/viajes/${viajeId}/anadirEntrada?apiKey=`+apiKey)
      .send({ fecha: '2026-01-01', contenido: 'Fuera de rango' });

    expect(response.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
    expect(response.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);

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
      .post('/viajes/fakeId123/anadirEntrada?apiKey='+apiKey)
      .send({ fecha: '2025-01-10', contenido: 'Algo' });

    expect(response.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
    expect(response.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);

    await usersRef.child(userKey).remove();
    await viajesRef.child(viajeId).remove();
  });

  it('Éxito 200: entrada añadida correctamente', async () => {
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
      .post(`/viajes/${viajeId}/anadirEntrada?apiKey=`+apiKey)
      .send({ fecha: '2025-05-10', contenido: 'Entrada de test' });

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Se ha añadido la entrada.");
    expect(response.body.idEntrada).toBeDefined();

    // Limpieza de la entrada
    await entradasRef.child(response.body.idEntrada).remove();

    await usersRef.child(userKey).remove();
    await viajesRef.child(viajeId).remove();
  });
});
