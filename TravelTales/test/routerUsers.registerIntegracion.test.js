import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest } from '@jest/globals';
import routerUsers from '../backend/routers/routerUsers.js';
import database from '../backend/database.js';
const { usersRef } = database;
import appErrors from '../backend/errors.js';


const app = express();
app.use(express.json());
app.use('/users', routerUsers); 

describe('POST /register', () => {

  it('debe registrar un usuario con datos validos', async () => {
    const newUser = {
      nombre: 'TestUser',
      apellidos: 'apellTestUser',
      email: 'test@example.com',
      contrasena: 'pwvalida'
    };

    const response = await request(app)
      .post('/users/register')
      .send(newUser);

    expect(response.status).toBe(200);  // registro exitoso
    expect(response.body.insertedUser).toHaveProperty('id');
    expect(response.body.insertedUser.email).toBe(newUser.email);
    expect(response.body.insertedUser.name).toBe(newUser.name);

    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(newUser.email).once('value');
    expect(snapshot.exists()).toBe(true);  // existe

    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();
  });

  it('debe retornar un error si el email ya esta registrado', async () => {
    const existingUser = {
      nombre: 'UserExistente',
      apellidos: 'apellUserExistente',
      email: 'test@example.com',
      contrasena: 'pwvalida'
    };

    // crea un usuario
    await request(app).post('/users/register').send(existingUser);

    const newUser = {
      nombre: 'OtroUser',
      apellidos: 'apellOtroUser',
      email: 'test@example.com', //igual que el anterior  
      contrasena: 'otrapassword',
    };

    const response = await request(app)
      .post('/users/register')
      .send(newUser);

    expect(response.status).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.httpStatus); // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.code); // Comprueba el codigo de error
    expect(response.body.error).toBe('Ya existe un usuario asignado al email introducido'); // comprueba que el mensaje de error sea el correcto


    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(newUser.email).once('value');
    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();
  });

  it('debe retornar un error si faltan el nombre', async () => {
    const invalidUser = {
      email: 'sinnombre@example.com',
      contrasena: 'short',  // sin nombre
    };

    const response = await request(app)
      .post('/users/register')
      .send(invalidUser);

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toContain('No se ha recibido un nombre');
  });

  it('debe retornar un error si faltan los apellidos', async () => {
    const invalidUser = {
      nombre: 'SinApellUser',
      email: 'malapw@example.com',
      contrasena: 'pwvalida', // sin apellido
    };

    const response = await request(app)
      .post('/users/register')
      .send(invalidUser);

    console.log(response.body)

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toContain('No se han recibido unos apellidos');
  });

  it('debe retornar un error si el falta el email', async () => {
    const userWithNoEmail = {
      nombre: 'UserSinEmail',
      apellidos: 'apellUserSinEmail',
      contrasena: 'pwvalida',
    };

    const response = await request(app)
      .post('/users/register')
      .send(userWithNoEmail);

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toContain('No se ha recibido un email');
  });
});
