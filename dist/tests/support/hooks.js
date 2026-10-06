"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const app_1 = require("../../src/app");
(0, cucumber_1.Before)(async function () {
    await (0, app_1.reiniciarEstado)();
    this.respuesta = undefined;
    this.token = '';
    this.emailPaciente = '';
    this.contrasenaPaciente = '';
    this.medicoId = 'medico-prueba';
    this.turnoId = 'turno-prueba';
});
