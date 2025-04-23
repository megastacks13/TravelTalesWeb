import request from 'supertest';
import express from 'express';
import routerUsers from '../backend/routers/routerUsers.js';
import { describe, it, expect, jest } from '@jest/globals';
import database from '../backend/database.js';
const { usersRef } = database;
import appErrors from '../backend/errors.js';


const app = express();
app.use(express.json());
app.use('/users', routerUsers); 

describe('POST /login', () => {

  it('Debe iniciar la sesión para un usuario con datos validos', async () => {
    const user = {
      nombre: 'User',
      apellidos: 'apellOtroUser',
      email: 'test@example.com', //igual que el anterior  
      contrasena: 'otrapassword',
    };

    await request(app)
          .post('/users/register')
          .send(user);

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(200);  // Login exitoso
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('apiKey');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe(user.email);

    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(user.email).once('value');
    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();
  });

  it('Debe devolver un error si falta el email', async () => {
    const user = {
      nombre: 'User',
      apellidos: 'apellOtroUser',
      email: 'test@example.com', //igual que el anterior  
      contrasena: 'otrapassword',
    };

    await request(app)
          .post('/users/register')
          .send(user);
    
    const noEmailUser = {
      contrasena: 'otrapassword'
    }

    const response = await request(app)
      .post('/users/login')
      .send(noEmailUser);

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toEqual(['No se ha recibido un email']);
  
    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(user.email).once('value');
    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();
  });

  it('Debe devolver un error si falta la contraseña', async () => {
    const user = {
      nombre: 'User',
      apellidos: 'apellOtroUser',
      email: 'test@example.com', //igual que el anterior  
      contrasena: 'otrapassword',
    };

    await request(app)
          .post('/users/register')
          .send(user);

    const noPassUser = {
      email: 'test@example.com'
    }

    const response = await request(app)
      .post('/users/login')
      .send(noPassUser);

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toEqual(['No se ha recibido una contraseña']);

    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(user.email).once('value');
    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();
  });

  it('Debe devolver un error si falta el correo y la contraseña', async () => {
    const user = {
      nombre: 'User',
      apellidos: 'apellOtroUser',
      email: 'test@example.com', //igual que el anterior  
      contrasena: 'otrapassword',
    };

    await request(app)
          .post('/users/register')
          .send(user);

    const response = await request(app)
      .post('/users/login')
      .send({});

    expect(response.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error 
    expect(response.body.error).toEqual(['No se ha recibido un email','No se ha recibido una contraseña']); 

    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(user.email).once('value');
    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();
  });

  it('El usuario debe existir en la BD', async () => {
    const user = {
      email: 'noExiste@example.com',
      contrasena: 'Pwvalida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toBe("Correo no registrado");

  });

  it('La contraseña no es correcta', async () => {
    const user = {
      nombre: 'User',
      apellidos: 'apellOtroUser',
      email: 'test@example.com', //igual que el anterior  
      contrasena: 'otrapassword',
    };

    await request(app)
          .post('/users/register')
          .send(user);

    const invalidPassUser = {
      email: 'test@example.com',
      contrasena: 'ContraNoValida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(invalidPassUser);

    expect(response.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);  // comprueba que se devuelva un error
    expect(response.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);  // comprueba que se devuelva un error
    expect(response.body.error).toBe("Contraseña incorrecta");

    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(user.email).once('value');
    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();

  });

});
