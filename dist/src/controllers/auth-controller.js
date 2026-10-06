"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearAuthRouter = crearAuthRouter;
const express_1 = require("express");
function manejarAsync(controlador) {
    return (request, response, next) => {
        void controlador(request, response).catch(next);
    };
}
function crearAuthRouter(servicio) {
    const router = (0, express_1.Router)();
    router.post('/register', manejarAsync(async (request, response) => {
        const cuerpo = request.body;
        const usuario = await servicio.registrar(cuerpo.nombre, cuerpo.email, cuerpo.contrasena ?? cuerpo.password);
        response.status(201).json(usuario);
    }));
    router.post('/login', manejarAsync(async (request, response) => {
        const cuerpo = request.body;
        const sesion = await servicio.iniciarSesion(cuerpo.email, cuerpo.contrasena ?? cuerpo.password);
        response.status(200).json({ token: sesion.token, usuario: sesion.usuario });
    }));
    return router;
}
