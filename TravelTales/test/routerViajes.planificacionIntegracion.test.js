import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());
app.use('/viajes', routerViajes);

describe('POST /planificacion', () => {
    //Test para comprobar la correcta adición de un viaje 
    //Codigo 200 (se añade correctamente)
    it('debe añadir un viaje con datos válidos', async () => {
      const nuevoViaje = {
        nombre: 'Vacaciones increibles',
        ubicacion: 'Hospitalet de Llobregat',
        fechaIni: '2025-08-01',
        fechaFin: '2025-08-10',
        num: 3,
        email: 'rubenvar@ucm.es'
      };
  
      const response = await request(app)
        .post('/viajes/anadir')
        .send(nuevoViaje);
  
      expect(response.status).toBe(200); //Codigo exitoso
      expect(response.body.viajeAnadido).toHaveProperty('id');
      expect(response.body.viajeAnadido.nombre).toBe(nuevoViaje.nombre);
      expect(response.body.viajeAnadido.ubicacion).toBe(nuevoViaje.ubicacion);
  
      // Verificar que el viaje esté en la base de datos
      const snapshot = await viajesRef.orderByChild('nombre').equalTo(nuevoViaje.nombre).once('value');
      expect(snapshot.exists()).toBe(true);
  
      // Limpieza de la BD
      const viajeKey = Object.keys(snapshot.val())[0];
      await viajesRef.child(viajeKey).remove();
    });

    //Tests con el código de error 400 - Correspondiente a datos inválidos
    //Si falta algún campo
    it('debe devolver un error si faltan campos requeridos', async () => {
        const nuevoViaje = {
          ubicacion: 'Madrid',
          fechaIni: '2025-08-01',
          fechaFin: '2025-08-10',
          num: 3,
          email: 'jteso@gmail.com'
        }; //En este caso falta un nombre y debería devolver un error
     
        const response = await request(app)
          .post('/viajes/anadir')
          .send(nuevoViaje);
     
        expect(response.status).toBe(400); // Asumiendo que el servidor devuelve un 400 para datos inválidos
        expect(response.body.error).toBe('El nombre es requerido');
    });

    //Fecha Inválida
    it('debe devolver un error si la fecha es inválida', async () => {
      const nuevoViaje = {
          nombre: 'ViajeErroneo',
          ubicacion: 'Barcelona',
          fechaIni: '00/00/0000',
          fechaFin: '2025-08-10',
          num: 3,
          email: 'jteso@gmail.com'
      };

      const response = await request(app)
          .post('/viajes/anadir')
          .send(nuevoViaje);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Fecha inválida');
    });

    //Si número de personas no es correcto (0)
    it('debe devolver un error si el número de personas es 0 o menor', async () => {
      const nuevoViaje = {
          nombre: 'ViajeCero',
          ubicacion: 'Valencia',
          fechaIni: '2025-08-01',
          fechaFin: '2025-08-10',
          num: 0,
          email: 'jteso@gmail.com'
      };

      const response = await request(app)
          .post('/viajes/anadir')
          .send(nuevoViaje);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Número de personas inválido');
    });

    //Si numero de personas no es correcto (k)
    it('debe devolver un error si el número de personas no es un entero positivo', async () => {
      const nuevoViaje = {
          nombre: 'ViajeK',
          ubicacion: 'Sevilla',
          fechaIni: '2025-08-01',
          fechaFin: '2025-08-10',
          num: 'k',
          email: 'jteso@gmail.com'
      };

      const response = await request(app)
          .post('/viajes/anadir')
          .send(nuevoViaje);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Número de personas debe ser un entero positivo');
    });

    it('debe devolver un error si la fecha de inicio es posterior a la fecha de fin', async () => {
      const nuevoViaje = {
        nombre: 'Vacaciones',
        ubicacion: 'Madrid',
        fechaIni: '2025-08-10',
        fechaFin: '2025-08-01', // Fecha de fin antes que la de inicio
        num: 3,
        email: 'jteso@gmail.com'
      };
   
      const response = await request(app)
        .post('/viajes/anadir')
        .send(nuevoViaje);
   
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('La fecha de inicio no puede ser posterior a la de fin');
   });

//Test código de error 401 - Correspondiente al error de autenticación
    it('debe devolver un error si el correo electrónico no está registrado', async () => {
        const nuevoViaje = {
          nombre: 'Vacaciones',
          ubicacion: 'Madrid',
          fechaIni: '2025-08-01',
          fechaFin: '2025-08-10',
          num: 3,
          email: 'correoNoRegistrado@gmail.com' // Un correo que no esté registrado
        };
     
        const response = await request(app)
          .post('/viajes/anadir')
          .send(nuevoViaje);
     
        expect(response.status).toBe(401); //Error para el correo no registrad0
        expect(response.body.error).toBe('Correo electrónico no registrado');
     });

});
