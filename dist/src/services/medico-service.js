"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicoService = void 0;
const node_crypto_1 = require("node:crypto");
const errors_1 = require("../models/errors");
class MedicoService {
    medicos;
    constructor(medicos) {
        this.medicos = medicos;
    }
    listar(especialidad) {
        return this.medicos.listar(especialidad).filter((medico) => medico.activo);
    }
    buscar(id) {
        const medico = this.medicos.buscarPorId(id);
        if (!medico)
            throw new errors_1.ErrorNoEncontrado('Médico no encontrado');
        return medico;
    }
    crear(datos) {
        const validado = this.validarDatos(datos);
        return this.medicos.crear({ id: (0, node_crypto_1.randomUUID)(), ...validado, activo: true, enLicencia: false });
    }
    actualizar(id, cambios) {
        const actual = this.buscar(id);
        const validado = this.validarDatos({
            nombre: cambios.nombre ?? actual.nombre,
            especialidad: cambios.especialidad ?? actual.especialidad,
            horarioLaboral: cambios.horarioLaboral ?? actual.horarioLaboral,
            duracionTurnoMinutos: cambios.duracionTurnoMinutos ?? actual.duracionTurnoMinutos,
        });
        const actualizado = this.medicos.actualizar(id, {
            ...validado,
            ...(typeof cambios.activo === 'boolean' ? { activo: cambios.activo } : {}),
            ...(typeof cambios.enLicencia === 'boolean' ? { enLicencia: cambios.enLicencia } : {}),
        });
        if (!actualizado)
            throw new errors_1.ErrorNoEncontrado('Médico no encontrado');
        return actualizado;
    }
    validarDatos(datos) {
        if (typeof datos.nombre !== 'string' || !datos.nombre.trim() || typeof datos.especialidad !== 'string' || !datos.especialidad.trim()) {
            throw new errors_1.ErrorValidacion('Nombre y especialidad son obligatorios');
        }
        if (!Number.isInteger(datos.duracionTurnoMinutos) || Number(datos.duracionTurnoMinutos) <= 0) {
            throw new errors_1.ErrorValidacion('La duración del turno debe ser un entero positivo');
        }
        if (typeof datos.horarioLaboral !== 'object' || datos.horarioLaboral === null || Array.isArray(datos.horarioLaboral)) {
            throw new errors_1.ErrorValidacion('El horario laboral no es válido');
        }
        const horario = datos.horarioLaboral;
        for (const franja of Object.values(horario)) {
            if (!franja || !/^\d{2}:\d{2}$/.test(franja.inicio) || !/^\d{2}:\d{2}$/.test(franja.fin) || franja.inicio >= franja.fin) {
                throw new errors_1.ErrorValidacion('Cada franja laboral debe tener inicio y fin válidos');
            }
        }
        return {
            nombre: datos.nombre.trim(),
            especialidad: datos.especialidad.trim(),
            horarioLaboral: horario,
            duracionTurnoMinutos: Number(datos.duracionTurnoMinutos),
        };
    }
}
exports.MedicoService = MedicoService;
