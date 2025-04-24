import request from 'supertest';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import appErrors from '../backend/errors.js'
import activeApiKeys from '../backend/activeApiKeys.js';
import jwt from 'jsonwebtoken';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());


// Mock de activeApiKeys
const mockActiveApiKeys = [];

jest.spyOn(activeApiKeys, 'push').mockImplementation((key) => mockActiveApiKeys.push(key));
jest.spyOn(activeApiKeys, 'indexOf').mockImplementation((key) => mockActiveApiKeys.indexOf(key));
jest.spyOn(activeApiKeys, 'splice').mockImplementation((index, count) => mockActiveApiKeys.splice(index, count));

app.use('/viajes', routerViajes);


beforeEach(() => {
    mockActiveApiKeys.length = 0; // Limpia el array antes de cada prueba
    mockActiveApiKeys.push('apiKey1');
    jest.spyOn(jwt, 'verify').mockImplementation((key, secret) => {return {email: "correo@correo.com"}});
});

afterEach(() => {
    jest.resetAllMocks(); // Limpia todos los mocks al final de cada test
});


describe('POST /anadir', () => {
    
    // Test de casos 400 ------------------------------------------------------------
    it('UNIT: should return 400 since the information is missing', async () => {
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({});

        expect(res.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("No se ha recibido un nombre");
        expect(res.body.error).toContain("No se ha recibido una ubicación");
        expect(res.body.error).toContain("No se han recibido una fecha de inicio");
        expect(res.body.error).toContain("No se han recibido una fecha de finalización");
        expect(res.body.error).toContain("No se ha recibido un número de personas");
    });

    it('UNIT: should return 400 since the dates are wrong', async () => {
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"01/01/2001", fechaFin:"00/00/0000", num:9});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
        expect(res.body.error).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    });

    it('UNIT: should return 400 since the dates are inexistent', async () => {
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2000-99-99", fechaFin:"9999-1-32", num:9});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
        expect(res.body.error).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    });

    it('UNIT: should return 400 since the dates are not in order', async () => {
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2001-01-01", num:9});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("La fecha de finalización debe ser posterior a la fecha de inicio");
    });

    it('UNIT: should return 400 since the people is not a positive number', async () => {
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:-3});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("El número de personas debe ser un número entero mayor o igual a 1");
    });

    it('UNIT: should return 400 since the people is NAN', async () => {
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:"k"});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.error).toContain("El número de personas debe ser un número entero mayor o igual a 1");
    });

    // Test de casos 404 ------------------------------------------------------------
    it('UNIT: should return 404 since the user does not exist', async () => {
        //Mock de usersRef para que devuelva null ya que ahora no tiene que existir el usuario
        jest.spyOn(usersRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => false,
                    val: () => null })
            })
        }));  

        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:9});

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toContain("No se ha encontrado usuario con ese id");
    });
    
    it('UNIT: should return 409 since the trip already exists', async () => {
        // Mock para usuario existente
        jest.spyOn(usersRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => true,
                    val: () => ({ "userID123": { email: "correo@correo.com" } 
                    }) 
                })
            })
        }));
        
        // Mock para viaje existente
        jest.spyOn(viajesRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => true,
                    val: () => ({ 
                        "viajeId123": { 
                            nombre: "Viaje Testarudo", 
                            ubicacion: "Las Antípodas", 
                            fechaIni: "2001-02-01", 
                            fechaFin: "2002-02-01", 
                            num: 9 
                        }  
                    }) 
                })
            })
        }));
        
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({ nombre: "Viaje Testarudo", ubicacion: "Las Antípodas", fechaIni: "2001-02-01", fechaFin: "2002-02-01", num: 9 });

        expect(res.status).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.code);
        expect(res.body.error).toContain("Ya has creado un viaje con el mismo nombre");
    });
        
    // Test de casos 200 ------------------------------------------------------------
    it('UNIT: should return 200 since the viaje was added', async () => {
        // Mock para usuario existente
        jest.spyOn(usersRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => true,
                    val: () => ({ "userID123": { email: "correo@correo.com" } 
                    }) 
                })
            })
        }));
        
        // Mock para viaje no existente
        jest.spyOn(viajesRef, 'orderByChild').mockImplementation(() => ({
            equalTo: () => ({
                once: () => Promise.resolve({ 
                    exists: () => false,
                    val: () => ({ }) 
                })
            })
        }));

        // Mock para la inserción del viaje
        jest.spyOn(viajesRef, 'push').mockImplementation(() => ({
            set: jest.fn(() => Promise.resolve()), // Simula que set() resuelve correctamente
            key: 'mockTripId' // Simula la key correspondiente al nuevo viaje cerado
        }));

        // Se inserta el viaje
        const res = await request(app)
            .post('/viajes/anadir?apiKey=apiKey1')
            .send({
                nombre: "Viaje Unitario", 
                ubicacion: "Las Antípodas", 
                fechaIni: "2001-09-01", 
                fechaFin: "2001-09-03", 
                num: 9
            });

        
        expect(res.status).toBe(200);
        expect(res.body.viajeAnadido).toEqual({
            id: 'mockTripId',
            nombre: "Viaje Unitario",
            ubicacion: "Las Antípodas",
            fechaIni: "2001-09-01",
            fechaFin: "2001-09-03",
            num: 9,
            email: 'correo@correo.com'
        });
    });
});