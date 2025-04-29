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

describe('GET /:id/buscar', () => {
    it('Debe devolver 405 porque no hay apiKey', async () => {
      const res = await request(app).get('/viajes/123/buscar');
      expect(res.status).toBe(405);
      expect(res.body.error).toBe("No apiKey");
    });
  
    it('Debe devolver 405 porque la apiKey es incorrecta', async () => {
      const res = await request(app).get('/viajes/123/buscar?apiKey=invalidToken');
      expect(res.status).toBe(405);
      expect(res.body.error).toBe("invalid apiKey");
    });
  
    it('Debe devolver 400 si no se pasa la ubicacion', async () => {
      const newUser = {
        nombre: 'UserParaBuscar',
        apellidos: 'ApellidoX',
        email: 'buscar@example.com',
        contrasena: 'Password1_'
      };
  
      const registerResponse = await request(app)
        .post('/users/register')
        .send(newUser);
      expect(registerResponse.status).toBe(200);
  
      const loginResponse = await request(app)
        .post('/users/login')
        .send({ email: newUser.email, contrasena: newUser.contrasena });
      expect(loginResponse.status).toBe(200);
  
      const apiKey = loginResponse.body.apiKey;
  
      const res = await request(app)
        .get(`/viajes/123/buscar?apiKey=${apiKey}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Falta la ubicación");
  
      // Limpieza
      await usersRef.child(loginResponse.body.id).remove();
    });
  
    it('debe devolver {} si no existen viajes con esa ubicacion', async () => {
      const newUser = {
        nombre: 'UserParaBuscar',
        apellidos: 'ApellidoX',
        email: 'buscar@example.com',
        contrasena: 'Password1_'
      };
  
      const registerResponse = await request(app)
        .post('/users/register')
        .send(newUser);
      expect(registerResponse.status).toBe(200);
  
      const loginResponse = await request(app)
        .post('/users/login')
        .send({ email: newUser.email, contrasena: newUser.contrasena });
      expect(loginResponse.status).toBe(200);
  
      const apiKey = loginResponse.body.apiKey;
  
      const res = await request(app)
        .get(`/viajes/123/buscar?apiKey=${apiKey}&ubicacion=DesiertoDelSahara`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
  
      // Limpieza
      await usersRef.child(loginResponse.body.id).remove();
    });
  
    it('Debe devolver el mismo viaje si todo ha ido correctamente', async () => {
      const newUser = {
        nombre: 'UserParaBuscar',
        apellidos: 'ApellidoX',
        email: 'buscar@example.com',
        contrasena: 'Password1_'
      };
  
      const registerResponse = await request(app)
        .post('/users/register')
        .send(newUser);
      expect(registerResponse.status).toBe(200);
  
      const loginResponse = await request(app)
        .post('/users/login')
        .send({ email: newUser.email, contrasena: newUser.contrasena });
      expect(loginResponse.status).toBe(200);
  
      const apiKey = loginResponse.body.apiKey;
  
      const trip = {
        nombre: "ViajeBusqueda",
        ubicacion: "Islandia",
        fechaIni: "2023-01-01",
        fechaFin: "2023-01-10",
        num: 2
      };
  
      const createResponse = await request(app)
        .post(`/viajes/anadir?apiKey=${apiKey}`)
        .send(trip);
      expect(createResponse.status).toBe(200);
  
      const res = await request(app)
        .get(`/viajes/123/buscar?apiKey=${apiKey}&ubicacion=Islandia`);
      expect(res.status).toBe(200);
  
      const result = Object.values(res.body).find(v => v.nombre === trip.nombre);
      expect(result).toBeDefined();
      expect(result.ubicacion).toBe("Islandia");
  
      // Limpieza
      await usersRef.child(loginResponse.body.id).remove();
      await viajesRef.child(createResponse.body.viajeAnadido.id).remove();
    });
  });
  