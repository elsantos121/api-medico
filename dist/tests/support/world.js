"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnosWorld = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
class TurnosWorld extends cucumber_1.World {
    api;
    respuesta;
    token = '';
    emailPaciente = '';
    contrasenaPaciente = '';
    medicoId = 'medico-prueba';
    turnoId = 'turno-prueba';
    constructor(opciones) {
        super(opciones);
        this.api = (0, supertest_1.default)(app_1.default);
    }
    async get(ruta) {
        let solicitud = this.api.get(ruta);
        if (this.token)
            solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
        this.respuesta = await solicitud;
    }
    async post(ruta, datos) {
        let solicitud = this.api.post(ruta).send(datos);
        if (this.token)
            solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
        this.respuesta = await solicitud;
        this.guardarIdentificadores();
    }
    async put(ruta, datos) {
        let solicitud = this.api.put(ruta).send(datos);
        if (this.token)
            solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
        this.respuesta = await solicitud;
        this.guardarIdentificadores();
    }
    async borrar(ruta) {
        let solicitud = this.api.delete(ruta);
        if (this.token)
            solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
        this.respuesta = await solicitud;
    }
    cuerpo() {
        if (!this.respuesta || typeof this.respuesta.body !== 'object' || this.respuesta.body === null) {
            return {};
        }
        return this.respuesta.body;
    }
    guardarIdentificadores() {
        const cuerpo = this.cuerpo();
        if (typeof cuerpo.id === 'string') {
            if ('pacienteId' in cuerpo || 'estado' in cuerpo)
                this.turnoId = cuerpo.id;
            else if ('especialidad' in cuerpo)
                this.medicoId = cuerpo.id;
        }
    }
}
exports.TurnosWorld = TurnosWorld;
(0, cucumber_1.setWorldConstructor)(TurnosWorld);
