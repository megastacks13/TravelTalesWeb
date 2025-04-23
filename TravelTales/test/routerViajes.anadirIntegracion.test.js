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

describe('POST /anadir', () => {
  it('Error 400: faltan datos', async() =>{
    const newTrip = {}

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

    const response = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toContain("No se ha recibido un nombre");
    expect(response.body.error).toContain("No se ha recibido una ubicación");
    expect(response.body.error).toContain("No se han recibido una fecha de inicio");
    expect(response.body.error).toContain("No se han recibido una fecha de finalización");
    expect(response.body.error).toContain("No se ha recibido un número de personas");

    // Limpieza de la bd
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove();
  })

  it('Error 404: formato no válido de fecha', async() =>{
    const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"01/01/2001", fechaFin:"2002/02/02", num:9}

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

    const response = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(response.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    expect(response.body.error).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove();
  })

  it('Error 404: la fecha de inicio es posterior a la fecha de finalización', async() =>{
    const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"2002-01-01", fechaFin:"2001-01-01", num:9}

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

    const response = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(response.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toContain("La fecha de finalización debe ser posterior a la fecha de inicio");
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove();
  })
  
  it('Integración: should return 401 for repeated trip name', async() =>{
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

    const response = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(response.status).toBe(200)

    // Añadimos de nuevo
    const response2 = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(response2.status).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response2.body.code).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.code);  // comprueba que se devuelva un error
    expect(response2.body.error).toContain("Ya has creado un viaje con el mismo nombre");

    // Limpieza de la bd
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove(); 
    const tripKey = response.body.viajeAnadido.id
    await viajesRef.child(tripKey).remove();
  })

  // --- 200
  it('Integración: should return 200', async() =>{
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

    const response = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(response.status).toBe(200)

    // Limpieza de la bd
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove(); 
    const tripKey = response.body.viajeAnadido.id
    await viajesRef.child(tripKey).remove();
  })
});
