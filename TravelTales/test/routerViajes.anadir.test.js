import request from 'supertest';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import routerViajes from '../backend/routers/routerViajes.js';
import appErrors from '../backend/errors.js'

// Mock completo de Firebaseconst createMockRef = () => {
const createMockRef = () => {
    const mock = {
        orderByChild: jest.fn().mockReturnThis(),
        equalTo: jest.fn().mockReturnThis(),
        once: jest.fn().mockImplementation(() => Promise.resolve({ exists: () => false })), // Fix here
        push: jest.fn().mockReturnThis(),
        set: jest.fn(),
        child: jest.fn().mockReturnThis(),
        remove: jest.fn()
    };
    return mock;
};


const mockUsersRef = createMockRef();
const mockViajesRef = createMockRef();

jest.mock('../backend/database.js', () => ({
    db: {},
    usersRef: mockUsersRef,
    viajesRef: mockViajesRef
}));

// Importar después del mock
import database from '../backend/database.js';
const { usersRef, viajesRef } = database;

const app = express();
app.use(express.json());

let isUserExistent = true;
let isValidApiKey = true;

// Mock del middleware de API keys
app.use('/viajes', (req, res, next) => {
    if (!isValidApiKey) {
        return res.status(401).json({ error: "invalid apiKey" });
    }
    
    if (isUserExistent) {
        req.infoApiKey = { email: 'correo@correo.com' };
    } else {
        req.infoApiKey = { email: null };
    }
    next();
});

app.use('/viajes', routerViajes);

describe('POST /anadir', () => {
    beforeEach(() => {
    jest.clearAllMocks();
    isUserExistent = true;
    isValidApiKey = true;

    // Reset mock implementations
    mockUsersRef.orderByChild.mockImplementation(() => mockUsersRef);
    mockUsersRef.equalTo.mockImplementation(() => mockUsersRef);
    mockUsersRef.once.mockImplementation(() => Promise.resolve({ exists: () => false })); // Fix here
    mockViajesRef.orderByChild.mockImplementation(() => mockViajesRef);
    mockViajesRef.equalTo.mockImplementation(() => mockViajesRef);
    mockViajesRef.once.mockImplementation(() => Promise.resolve({ exists: () => false })); // Fix here
});


    // Test de casos 400 ------------------------------------------------------------
    it('UNIT: should return 400 since the information is missing', async () => {
        isUserExistent = false;
        const res = await request(app)
            .post('/viajes/anadir')
            .send({});

        expect(res.status).toBe(appErrors.MISSING_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.MISSING_ARGUMENT_ERROR.code);
        expect(res.body.errors).toContain("No se ha recibido un nombre");
        expect(res.body.errors).toContain("No se ha recibido una ubicación");
        expect(res.body.errors).toContain("No se han recibido una fecha de inicio");
        expect(res.body.errors).toContain("No se han recibido una fecha de finalización");
        expect(res.body.errors).toContain("No se ha recibido un número de personas");
        expect(res.body.errors).toContain("No se ha recibido el correo del usuario");
    });

    it('UNIT: should return 400 since the dates are wrong', async () => {
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"01/01/2001", fechaFin:"00/00/0000", num:9});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.errors).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
        expect(res.body.errors).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    });

    it('UNIT: should return 400 since the dates are inexistent', async () => {
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2000-99-99", fechaFin:"9999-1-32", num:9});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.errors).toContain("La fecha de inicio no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
        expect(res.body.errors).toContain("La fecha de finalización no tiene un formato válido (yyyy-mm-dd) o contiene valores incorrectos.");
    });

    it('UNIT: should return 400 since the dates are not in order', async () => {
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2001-01-01", num:9});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.errors).toContain("La fecha de finalización debe ser posterior a la fecha de inicio");
    });

    it('UNIT: should return 400 since the people is not a positive number', async () => {
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:-3});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.errors).toContain("El número de personas debe ser un número entero mayor o igual a 1");
    });

    it('UNIT: should return 400 since the people is NAN', async () => {
        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:"k"});

        expect(res.status).toBe(appErrors.INVALID_ARGUMENT_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.INVALID_ARGUMENT_ERROR.code);
        expect(res.body.errors).toContain("El número de personas debe ser un número entero mayor o igual a 1");
    });

    // Test de casos 404 ------------------------------------------------------------
    it('UNIT: should return 404 since the user does not exist', async () => {
        usersRef.once.mockResolvedValueOnce({ exists: () => false });

        const res = await request(app)
            .post('/viajes/anadir')
            .send({nombre:"Viaje Testarudo", ubicacion:"Las Antípodas", fechaIni:"2001-02-01", fechaFin:"2002-02-01", num:9});

        expect(res.status).toBe(appErrors.DATA_NOT_FOUND_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.DATA_NOT_FOUND_ERROR.code);
        expect(res.body.error).toContain("No existe un usuario con ese correo");
    });
    
    it('UNIT: should return 409 since the trip already exists', async () => {
        // Mock para usuario existente
        usersRef.once.mockResolvedValueOnce({ 
            exists: () => true,
            val: () => ({ "userID123": { email: "correo@correo.com" } })
        });

        // Mock para viaje existente
        viajesRef.once.mockResolvedValueOnce({ 
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
        });

        const res = await request(app)
            .post('/viajes/anadir')
            .send({ nombre: "Viaje Testarudo", ubicacion: "Las Antípodas", fechaIni: "2001-02-01", fechaFin: "2002-02-01", num: 9 });

        expect(res.status).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.httpStatus);
        expect(res.body.code).toBe(appErrors.UNIQUE_KEY_VIOLATION_ERROR.code);
        expect(res.body.error).toContain("Ya has creado un viaje con el mismo nombre");
    });
        
    // Test de casos 200 ------------------------------------------------------------
    it('UNIT: should return 200 since the viaje was added', async () => {
        // Mock para usuario existente
        usersRef.once.mockResolvedValueOnce({ exists: () => true });

        // Mock para viaje no existente
        viajesRef.once.mockResolvedValueOnce({ exists: () => false });

        // Mock para la inserción del viaje
        const mockPushRef = {
            key: 'mockTripId',
            set: jest.fn().mockResolvedValueOnce(null)
        };
        viajesRef.push.mockReturnValueOnce(mockPushRef);

        const res = await request(app)
            .post('/viajes/anadir')
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