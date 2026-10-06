"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearMedicoRouter = crearMedicoRouter;
exports.crearAdminMedicoRouter = crearAdminMedicoRouter;
exports.identidadDe = identidadDe;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
function manejarAsync(controlador) {
    return (request, response, next) => {
        Promise.resolve(controlador(request, response)).catch(next);
    };
}
function crearMedicoRouter(medicos, turnos) {
    const router = (0, express_1.Router)();
    router.get('/', (request, response) => {
        const especialidad = typeof request.query.especialidad === 'string' ? request.query.especialidad : undefined;
        response.json(medicos.listar(especialidad));
    });
    router.get('/:id/disponibilidad', manejarAsync((request, response) => {
        const fecha = typeof request.query.fecha === 'string' ? request.query.fecha : '';
        response.json(turnos.disponibilidad(parametroRuta(request.params.id), fecha));
    }));
    return router;
}
function crearAdminMedicoRouter(medicos, auth) {
    const router = (0, express_1.Router)();
    router.use((0, auth_1.autenticar)(auth), (0, auth_1.exigirRol)('admin'));
    router.post('/', manejarAsync((request, response) => {
        response.status(201).json(medicos.crear(request.body));
    }));
    router.put('/:id', manejarAsync((request, response) => {
        response.json(medicos.actualizar(parametroRuta(request.params.id), request.body));
    }));
    return router;
}
function identidadDe(request) {
    return request.identidad;
}
function parametroRuta(valor) {
    return Array.isArray(valor) ? valor[0] : valor;
}
