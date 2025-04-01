import request from 'supertest';
import { describe, it, expect, jest } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());

let isUserExistent = true
// Mock del middleware de API keys
app.use('/viajes', (req, res, next) => {
    // Simulamos que la API key es válida y añadimos infoApiKey al request
    if (isUserExistent)
        req.infoApiKey = { email: 'correo@correo.com' };
    else
        req.infoApiKey = {email: null}
    next();
});

app.use('/viajes', routerViajes);

describe('POST /anadir', () => {
    isUserExistent = false
    // Test de casos 400 ------------------------------------------------------------
    it('should return 400 since the information is missing', async () => {
        const res = await request(app)
            .post('/viajes/anadir')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("No se ha recibido un nombre");
        expect(res.body.errors).toContain("No se ha recibido una ubicación");
        expect(res.body.errors).toContain("No se han recibido una fecha de inicio");
        expect(res.body.errors).toContain("No se han recibido una fecha de finalización");
        expect(res.body.errors).toContain("No se ha recibido un número de personas");
        expect(res.body.errors).toContain("No se ha recibido el correo del usuario");
    });

    it('should return 400 since the dates are wrong', async () => {
        isUserExistent = true
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"01/01/2001", fechaFin:"00/00/0000", num:9});

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
        expect(res.body.errors).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    });

    it('should return 400 since the dates are inexistent', async () => {
        isUserExistent = true
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2000-99-99", fechaFin:"9999-1-32", num:9});

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
        expect(res.body.errors).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    });

    it('should return 400 since the dates are not in order', async () => {
        isUserExistent = true
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2001-01-01", num:9});

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("La fecha de finalización debe ser posterior a la fecha de inicio");
    });

    it('should return 400 since the people is not a positive number', async () => {
        isUserExistent = true
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:-3});

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("El número de personas debe ser un número entero mayor o igual a 1");
    });

    it('should return 400 since the people is NAN', async () => {
        isUserExistent = true
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:"k"});

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("El número de personas debe ser un número entero mayor o igual a 1");
    });

    // Test de casos 401 ------------------------------------------------------------

    it('should return 401 since the user does not exist', async () => {
        isUserExistent = true
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:9});

        expect(res.status).toBe(401);
        expect(res.body.error).toContain("No existe un usuario con ese correo");
    });
    
    it('should return 401 since the trip already exists', async () => {
        isUserExistent = true
        // Asumimos usuario existente
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                "userID123": { email: "correo@correo.com" }
            })
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });
    
        // Asumimos viaje existente para el usuario
        const mockSnapshotViajes = {
            exists: jest.fn().mockReturnValue(true),
            val: jest.fn().mockReturnValue({
                "viajeId123": { nombre: "Viaje Testarudo", ubicacion: "Las Antípodas", fechaIni: "2001-02-01", fechaFin: "2002-02-01", num: 9 }
            })
        };
        jest.spyOn(viajesRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotViajes),
            }),
        });
    
        const res = await request(app)
            .post('/viajes/anadir')
            .send({ nombre: "Viaje Testarudo", ubicacion: "Las Antípodas", fechaIni: "2001-02-01", fechaFin: "2002-02-01", num: 9 });
    
        expect(res.status).toBe(401);
        expect(res.body.error).toContain("Ya has creado un viaje con el mismo nombre");
    });
        
    // Test de casos 200 ------------------------------------------------------------

    it('should return 200 since the viaje was added', async () => {
        isUserExistent = true
        // Esto lo uso para no tener que preocuparme de que exista el usuario
        const mockSnapshotUser = {
            exists: jest.fn().mockReturnValue(true),
        };
        jest.spyOn(usersRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotUser),
            }),
        });
        // Decimos que el viaje no existe
        const mockSnapshotViajes = {
            exists: jest.fn().mockReturnValue(false),
        };
        jest.spyOn(viajesRef, 'orderByChild').mockReturnValue({
            equalTo: jest.fn().mockReturnValue({
                once: jest.fn().mockResolvedValue(mockSnapshotViajes),
            }),
        });

        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-09-01", fechaFin:"2001-09-03", num:9});

        expect(res.status).toBe(200);
        let viajeAnadido = res.body.viajeAnadido;
        let tieneId = delete viajeAnadido['id'];
        expect(tieneId).toBe(true);
        expect(viajeAnadido).toEqual({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-09-01", fechaFin:"2001-09-03", num:9, email:'correo@correo.com'});
    });
});