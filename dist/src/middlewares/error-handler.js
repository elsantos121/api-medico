"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manejarErrores = void 0;
const errors_1 = require("../models/errors");
const manejarErrores = (error, _request, response, _next) => {
    void _next;
    if (error instanceof errors_1.ErrorDominio) {
        response.status(error.estadoHttp).json({ error: error.message });
        return;
    }
    response.status(500).json({ error: 'Error interno del servidor' });
};
exports.manejarErrores = manejarErrores;
