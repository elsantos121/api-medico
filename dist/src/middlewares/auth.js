"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = autenticar;
exports.exigirRol = exigirRol;
const errors_1 = require("../models/errors");
function autenticar(auth) {
    return (request, _response, next) => {
        const token = request.header('authorization')?.match(/^Bearer (.+)$/i)?.[1];
        if (!token)
            return next(new errors_1.ErrorNoAutorizado());
        try {
            request.identidad = auth.verificarToken(token);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function exigirRol(rol) {
    return (request, _response, next) => {
        const identidad = request.identidad;
        if (!identidad)
            return next(new errors_1.ErrorNoAutorizado());
        if (identidad.rol !== rol)
            return next(new errors_1.ErrorProhibido());
        next();
    };
}
