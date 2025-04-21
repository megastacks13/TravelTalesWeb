import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);
app.use('/users', routerUsers);

describe('POST /anadir', () => {
  // Errores:
  // 400 -> Cosas variadas
  // 401 -> Usuario inexistente o viaje de nombre repetido
  // 402 -> Error inserccion
  // 200 -> Viaje insertado
  it('Error 400: faltan datos', async() =>{
    const newTrip = {}

    const newUser = {
          nombre: 'UserDeMiIntergasion',
          apellidos: 'apellTestUser',
          email: 'test@exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.com',
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

    const res = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain("No se ha recibido un nombre");
    expect(res.body.errors).toContain("No se ha recibido una ubicación");
    expect(res.body.errors).toContain("No se han recibido una fecha de inicio");
    expect(res.body.errors).toContain("No se han recibido una fecha de finalización");
    expect(res.body.errors).toContain("No se ha recibido un número de personas");

    // Limpieza de la bd
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove();
  })

  it('Error 404: formato no válido de fecha', async() =>{
    const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"01/01/2001", fechaFin:"2002/02/02", num:9}

    const newUser = {
          nombre: 'UserDeMiIntergasion',
          apellidos: 'apellTestUser',
          email: 'test@exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.com',
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

    const res = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    expect(res.body.errors).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove();
  })

  it('Error 404: la fecha de inicio es posterior a la fecha de finalización', async() =>{
    const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"2002-01-01", fechaFin:"2001-01-01", num:9}

    const newUser = {
          nombre: 'UserDeMiIntergasion',
          apellidos: 'apellTestUser',
          email: 'test@exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.com',
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

    const res = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain("La fecha de finalización debe ser posterior a la fecha de inicio");
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove();
  })
  
  it('Integración: should return 401 for repeated trip name', async() =>{
    const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"2001-01-01", fechaFin:"2002-02-02", num:9}

    const newUser = {
          nombre: 'UserDeMiIntergasion',
          apellidos: 'apellTestUser',
          email: 'test@exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.com',
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

    const res = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(res.status).toBe(200)

    // Añadimos de nuevo
    const res2 = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(res2.status).toBe(401)
    expect(res2.body.error).toContain("Ya has creado un viaje con el mismo nombre");

    // Limpieza de la bd
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove(); 
    const tripKey = res.body.viajeAnadido.id
    await viajesRef.child(tripKey).remove();
  })

  // --- 200
  it('Integración: should return 200', async() =>{
    const newTrip = {nombre:"Viaje Integracionoso", ubicacion:"Las Antípodas", fechaIni:"2001-01-01", fechaFin:"2002-02-02", num:9}

    const newUser = {
          nombre: 'UserDeMiIntergasion',
          apellidos: 'apellTestUser',
          email: 'test@exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.com',
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

    const res = await request(app)
                .post('/viajes/anadir?apiKey='+apiKey)
                .send(newTrip)

    expect(res.status).toBe(200)

    // Limpieza de la bd
    const userKey = loginResponse.body.id
    await usersRef.child(userKey).remove(); 
    const tripKey = res.body.viajeAnadido.id
    await viajesRef.child(tripKey).remove();
  })
});
