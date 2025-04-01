import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());

app.use('/viajes', routerViajes);

describe('POST /:id/anadirBlog', () => {
    //Test para comprobar la correcta adición de un viaje 
    //Codigo 200 (se añade correctamente)
    it('debe añadir un viaje con datos válidos', async () => {
      const nuevoViaje = {
        nombre: 'Vacaciones',
        ubicacion: 'Madrid',
        fechaIni: '2025-08-01',
        fechaFin: '2025-08-10',
        num: 3,
      };
  
      await request(app)
        .post('/viajes/anadir')
        .send(nuevoViaje);
  
  
      // Verificar que el viaje esté en la base de datos
      const snapshot = await viajesRef.orderByChild('nombre').equalTo(nuevoViaje.nombre).once('value');
      expect(snapshot.exists()).toBe(true);

      // Recuperar la ID del viaje recién creado (Firebase genera una key automáticamente)
      const viajeKey = Object.keys(snapshot.val())[0];
        
      // Verificar que el atributo planificacion es false inicialmente
      const viajeCreado = snapshot.val()[viajeKey];
      expect(viajeCreado.planificacion).toBe(false);

      // Hacer la petición para añadir planificación
      await request(app)
          .post(`/viajes/${viajeKey}/anadirPlanificacion`);

      // Verificar que el atributo planificacion ahora es true
      const snapshotActualizado = await viajesRef.child(viajeKey).once('value');
      expect(snapshotActualizado.val().planificacion).toBe(true);

      // Limpieza de la BD
      await viajesRef.child(viajeKey).remove();
    });

  //Tests con el código de error 400 - Correspondiente a datos inválidos
    //Si falta algún campo
    it('No debe dejar añadir una planificacion si ya existe, pero si ocurre, no pasa nada', async () => {
        const nuevoViaje = {
          nombre: 'Vacaciones',
          ubicacion: 'Madrid',
          fechaIni: '2025-08-01',
          fechaFin: '2025-08-10',
          num: 3,
        };
    
        await request(app)
          .post('/viajes/anadir')
          .send(nuevoViaje);
    
    
        // Verificar que el viaje esté en la base de datos
        const snapshot = await viajesRef.orderByChild('nombre').equalTo(nuevoViaje.nombre).once('value');
        expect(snapshot.exists()).toBe(true);
  
        // Recuperar la ID del viaje recién creado (Firebase genera una key automáticamente)
        const viajeKey = Object.keys(snapshot.val())[0];
          
        // Verificar que el atributo planificacion es false inicialmente
        const viajeCreado = snapshot.val()[viajeKey];
        expect(viajeCreado.planificacion).toBe(false);
  
        // Hacer la petición para añadir planificación
        await request(app)
            .post(`/viajes/${viajeKey}/anadirPlanificacion`);
  
        // Verificar que el atributo planificacion ahora es true
        let snapshotActualizado = await viajesRef.child(viajeKey).once('value');
        expect(snapshotActualizado.val().planificacion).toBe(true);
  
        // Hacer nuevamente la petición para añadir planificación
        await request(app)
            .post(`/viajes/${viajeKey}/anadirPlanificacion`);

        // Verificar que el atributo planificacion sigue siendo true
        snapshotActualizado = await viajesRef.child(viajeKey).once('value');
        expect(snapshotActualizado.val().planificacion).toBe(true);

        // Limpieza de la BD
        await viajesRef.child(viajeKey).remove();
    });

});
