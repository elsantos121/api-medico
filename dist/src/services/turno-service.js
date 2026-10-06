"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnoService = void 0;
const node_crypto_1 = require("node:crypto");
const errors_1 = require("../models/errors");
const disponibilidad_service_1 = require("./disponibilidad-service");
const turno_rules_1 = require("./turno-rules");
class TurnoService {
    turnos;
    medicos;
    reloj;
    constructor(turnos, medicos, reloj) {
        this.turnos = turnos;
        this.medicos = medicos;
        this.reloj = reloj;
    }
    disponibilidad(medicoId, fecha) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(`${fecha}T00:00:00.000Z`))) {
            throw new errors_1.ErrorValidacion('La fecha debe tener formato AAAA-MM-DD');
        }
        const medico = this.buscarMedicoReservable(medicoId);
        const dia = new Date(`${fecha}T12:00:00.000Z`).toLocaleDateString('es', { weekday: 'long', timeZone: 'UTC' });
        const horario = medico.horarioLaboral[dia];
        if (!horario)
            return [];
        const ocupados = this.turnos.listar()
            .filter((turno) => turno.medicoId === medicoId && turno.estado === 'reservado')
            .map((turno) => ({ fecha: turno.fecha, hora: turno.hora, duracionMinutos: medico.duracionTurnoMinutos }));
        return (0, disponibilidad_service_1.generarFranjasLibres)(horario, medico.duracionTurnoMinutos, ocupados, fecha);
    }
    reservar(pacienteId, medicoId, fecha, hora) {
        if (typeof medicoId !== 'string' || typeof fecha !== 'string' || typeof hora !== 'string' || !/^\d{2}:\d{2}$/.test(hora)) {
            throw new errors_1.ErrorValidacion('Médico, fecha y hora son obligatorios');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
            throw new errors_1.ErrorValidacion('La fecha debe tener formato AAAA-MM-DD');
        const inicio = (0, turno_rules_1.fechaHora)(fecha, hora);
        if (Number.isNaN(inicio.getTime()) || inicio.getTime() < this.reloj.ahora().getTime())
            throw new errors_1.ErrorValidacion('No se puede reservar en una fecha pasada');
        const medico = this.buscarMedicoReservable(medicoId);
        const dia = new Date(`${fecha}T12:00:00.000Z`).toLocaleDateString('es', { weekday: 'long', timeZone: 'UTC' });
        const horario = medico.horarioLaboral[dia];
        const minutoInicio = (0, turno_rules_1.minutosDesdeMedianoche)(hora);
        if (!horario || minutoInicio < (0, turno_rules_1.minutosDesdeMedianoche)(horario.inicio) || minutoInicio + medico.duracionTurnoMinutos > (0, turno_rules_1.minutosDesdeMedianoche)(horario.fin)) {
            throw new errors_1.ErrorValidacion('El horario está fuera de la jornada laboral');
        }
        const reservas = this.turnos.listar().filter((turno) => turno.estado === 'reservado');
        if (reservas.some((turno) => turno.pacienteId === pacienteId && turno.medicoId === medicoId && turno.fecha === fecha)) {
            throw new errors_1.ErrorConflicto('Ya tenés un turno con este médico en esa fecha');
        }
        const ocupados = reservas.filter((turno) => turno.medicoId === medicoId).map((turno) => ({
            fecha: turno.fecha,
            hora: turno.hora,
            duracionMinutos: medico.duracionTurnoMinutos,
        }));
        if ((0, turno_rules_1.haySolapamiento)(hora, medico.duracionTurnoMinutos, ocupados, fecha))
            throw new errors_1.ErrorConflicto('El horario solicitado ya está ocupado');
        return this.turnos.crear({ id: (0, node_crypto_1.randomUUID)(), pacienteId, medicoId, fecha, hora, estado: 'reservado' });
    }
    cancelar(turnoId, pacienteId) {
        const turno = this.turnos.buscarPorId(turnoId);
        if (!turno)
            throw new errors_1.ErrorNoEncontrado('Turno no encontrado');
        if (turno.pacienteId !== pacienteId)
            throw new errors_1.ErrorProhibido('No podés cancelar el turno de otra persona');
        if (!(0, turno_rules_1.puedeCancelarTurno)(turno, this.reloj.ahora()))
            throw new errors_1.ErrorConflicto('El turno no se puede cancelar con menos de 24 horas o porque ya pasó');
        const cancelado = this.turnos.actualizar(turnoId, { estado: 'cancelado' });
        if (!cancelado)
            throw new errors_1.ErrorNoEncontrado('Turno no encontrado');
        return cancelado;
    }
    misTurnos(pacienteId) {
        return this.turnos.listar()
            .filter((turno) => turno.pacienteId === pacienteId)
            .sort((primero, segundo) => `${primero.fecha}T${primero.hora}`.localeCompare(`${segundo.fecha}T${segundo.hora}`));
    }
    buscarMedicoReservable(id) {
        const medico = this.medicos.buscarPorId(id);
        if (!medico)
            throw new errors_1.ErrorNoEncontrado('Médico no encontrado');
        if (!medico.activo || medico.enLicencia)
            throw new errors_1.ErrorConflicto('El médico no está disponible');
        return medico;
    }
}
exports.TurnoService = TurnoService;
