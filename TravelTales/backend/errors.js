"use strict"

// Errores del cliente (4xx)  
const MISSING_ARGUMENT_ERROR = { code: 4001, httpStatus: 400 }; // Falta argumento  
const INVALID_ARGUMENT_ERROR = { code: 4002, httpStatus: 422 }; // Argumento inválido  
const UNIQUE_KEY_VIOLATION_ERROR = { code: 4003, httpStatus: 409 }; // Violación de clave única 
const DATA_NOT_FOUND_ERROR = {code:4004, httpStatus:404} // No se ha encontrado un dato
const API_NOT_FOUND_ERROR = { code: 4004, httpStatus: 404 }; // API no existe  
 
// Errores del servidor (5xx)  
const INTERNAL_SERVER_ERROR = { code: 5001, httpStatus: 500 }; // Error genérico  
const OPERATION_FAILED_ERROR = { code: 5002, httpStatus: 500 }; // Fallo en try-catch  

// Funcion para lanzar errores
const throwError = (res, errorType, customMessage = null) => {
    if (!customMessage) customMessage = getDefaultMessage(errorType)
    res.status(errorType.httpStatus).json({error:customMessage, code:errorType.code})
};

// Mensajes por defecto para cada error
function getDefaultMessage(errorType) {
    const messages = {
      MISSING_ARGUMENT_ERROR: "Falta un argumento requerido",
      INVALID_ARGUMENT_ERROR: "Argumento inválido",
      UNIQUE_KEY_VIOLATION_ERROR: "Violación de clave única",
      DATA_NOT_FOUND_ERROR: "Archivo no encontrado",
      API_NOT_FOUND_ERROR: "Endpoint no encontrado",
      INTERNAL_SERVER_ERROR: "Error interno del servidor",
      OPERATION_FAILED_ERROR: "Operación fallida"
    };
    return messages[errorType] || "Error desconocido";
  }

  
export default {
    MISSING_ARGUMENT_ERROR,
    INVALID_ARGUMENT_ERROR,
    UNIQUE_KEY_VIOLATION_ERROR,
    API_NOT_FOUND_ERROR,
    INTERNAL_SERVER_ERROR,
    OPERATION_FAILED_ERROR,
    DATA_NOT_FOUND_ERROR,
    throwError
};