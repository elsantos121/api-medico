"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearTurnoRouter = crearTurnoRouter;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
function manejarAsync(controlador) {
    return (request, response, next) => {
        Promise.resolve(controlador(request, response)).catch(next);
    };
}
function identidad(request) {
    return request.identidad;
}
function crearTurnoRouter(turnos, auth) {
    const router = (0, express_1.Router)();
    router.use((0, auth_1.autenticar)(auth), (0, auth_1.exigirRol)('paciente'));
    router.post('/', manejarAsync((request, response) => {
        const cuerpo = request.body;
        const turno = turnos.reservar(identidad(request).id, cuerpo.medicoId, cuerpo.fecha, cuerpo.hora);
        response.status(201).json(turno);
    }));
    router.delete('/:id', manejarAsync((request, response) => {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        response.json(turnos.cancelar(id, identidad(request).id));
    }));
    router.get('/mios', (request, response) => {
        response.json(turnos.misTurnos(identidad(request).id));
    });
    return router;
}
