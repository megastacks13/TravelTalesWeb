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
          nombre: 'TestUser',
          apellidos: 'apellTestUser',
          email: 'test@example.com',
          contrasena: 'pwvalida'
        };
    
    await request(app).post('/users/register').send(user);

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
    expect(snapshot.exists()).toBe(true);  // existe

    // Limpieza de la bd
    const userKey = Object.keys(snapshot.val())[0];
    await usersRef.child(userKey).remove();

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
      nombre: 'TestUser',
      apellidos: 'apellTestUser',
      email: 'test@example.com',
      contrasena: 'pwvalida'
    };

    const response1= await request(app).post('/users/register').send(user);
    console.log(response1)

    const invalidUser = {
      email: 'test@example.com',
      contrasena: 'ContraNoValida1_'
    };

    const response = await request(app)
      .post('/users/login')
      .send(invalidUser);

    expect(response.status).toBe(402); 
    expect(response.body.error).toBe("Contraseña incorrecta");

    // Verifica que el usuario haya sido insertado en la base de datos
    const snapshot = await usersRef.orderByChild('email').equalTo(user.email).once('value');
    if (snapshot){
      // Limpieza de la bd
      const userKey = Object.keys(snapshot.val())[0];
      await usersRef.child(userKey).remove();
    }

  });

});
