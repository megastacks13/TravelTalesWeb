import request from 'supertest';
import express from 'express';
import routerUsers from '../backend/routers/routerUsers.js';
import { describe, it, expect, jest } from '@jest/globals';
import database from '../backend/database.js';
const { usersRef } = database;


const app = express();
app.use(express.json());
app.use('/users', routerUsers); 

describe('POST /login', () => {

  it('Debe iniciar la sesión para un usuario con datos validos', async () => {
    const user = {
      email: 'test@example.com',
      contrasena: 'Pwvalida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(200);  // Login exitoso
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('apiKey');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe(user.email);

  });

  it('Debe devolver un error si falta el email', async () => {
    const user = {
      contrasena: 'Pwvalida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(400); 
    expect(response.body.errors).toEqual(['No se ha recibido un email']);
  });

  it('Debe devolver un error si falta la contraseña', async () => {
    const user = {
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(400); 
    expect(response.body.errors).toEqual(['No se ha recibido una contraseña']);
  });

  it('Debe devolver un error si falta el correo y la contraseña', async () => {
    const user = {
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(400); 
    expect(response.body.errors).toEqual(['No se ha recibido un email','No se ha recibido una contraseña']); 
  });

  it('El usuario debe existir en la BD', async () => {
    const user = {
      email: 'noExiste@example.com',
      contrasena: 'Pwvalida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(401); 
    expect(response.body.error).toBe("Correo no válido");

  });

  it('La contraseña no es correcta', async () => {
    const user = {
      email: 'test@example.com',
      contrasena: 'ContraNoValida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(user);

    expect(response.status).toBe(402); 
    expect(response.body.error).toBe("Contraseña incorrecta");

  });

});
