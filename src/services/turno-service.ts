import { randomUUID } from 'node:crypto';
import { Clock, Medico, Turno, TurnoOcupado } from '../models/entities';
import { ErrorConflicto, ErrorNoEncontrado, ErrorProhibido, ErrorValidacion } from '../models/errors';
import { IMedicoRepository, ITurnoRepository } from '../repositories/contracts';
import { generarFranjasLibres } from './disponibilidad-service';
import { fechaHora, haySolapamiento, minutosDesdeMedianoche, puedeCancelarTurno } from './turno-rules';

export class TurnoService {
  constructor(
    private readonly turnos: ITurnoRepository,
    private readonly medicos: IMedicoRepository,
    private readonly reloj: Clock,
  ) {}

  disponibilidad(medicoId: string, fecha: string): string[] {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(`${fecha}T00:00:00.000Z`))) {
      throw new ErrorValidacion('La fecha debe tener formato AAAA-MM-DD');
    }
    const medico = this.buscarMedicoReservable(medicoId);
    const dia = new Date(`${fecha}T12:00:00.000Z`).toLocaleDateString('es', { weekday: 'long', timeZone: 'UTC' });
    const horario = medico.horarioLaboral[dia];
    if (!horario) return [];
    const ocupados = this.turnos.listar()
      .filter((turno) => turno.medicoId === medicoId && turno.estado === 'reservado')
      .map((turno): TurnoOcupado => ({ fecha: turno.fecha, hora: turno.hora, duracionMinutos: medico.duracionTurnoMinutos }));
    return generarFranjasLibres(horario, medico.duracionTurnoMinutos, ocupados, fecha);
  }

  reservar(pacienteId: string, medicoId: unknown, fecha: unknown, hora: unknown): Turno {
    if (typeof medicoId !== 'string' || typeof fecha !== 'string' || typeof hora !== 'string' || !/^\d{2}:\d{2}$/.test(hora)) {
      throw new ErrorValidacion('Médico, fecha y hora son obligatorios');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new ErrorValidacion('La fecha debe tener formato AAAA-MM-DD');
    const inicio = fechaHora(fecha, hora);
    if (Number.isNaN(inicio.getTime()) || inicio.getTime() < this.reloj.ahora().getTime()) throw new ErrorValidacion('No se puede reservar en una fecha pasada');
    const medico = this.buscarMedicoReservable(medicoId);
    const dia = new Date(`${fecha}T12:00:00.000Z`).toLocaleDateString('es', { weekday: 'long', timeZone: 'UTC' });
    const horario = medico.horarioLaboral[dia];
    const minutoInicio = minutosDesdeMedianoche(hora);
    if (!horario || minutoInicio < minutosDesdeMedianoche(horario.inicio) || minutoInicio + medico.duracionTurnoMinutos > minutosDesdeMedianoche(horario.fin)) {
      throw new ErrorValidacion('El horario está fuera de la jornada laboral');
    }

    const reservas = this.turnos.listar().filter((turno) => turno.estado === 'reservado');
    if (reservas.some((turno) => turno.pacienteId === pacienteId && turno.medicoId === medicoId && turno.fecha === fecha)) {
      throw new ErrorConflicto('Ya tenés un turno con este médico en esa fecha');
    }
    const ocupados = reservas.filter((turno) => turno.medicoId === medicoId).map((turno) => ({
      fecha: turno.fecha,
      hora: turno.hora,
      duracionMinutos: medico.duracionTurnoMinutos,
    }));
    if (haySolapamiento(hora, medico.duracionTurnoMinutos, ocupados, fecha)) throw new ErrorConflicto('El horario solicitado ya está ocupado');
    return this.turnos.crear({ id: randomUUID(), pacienteId, medicoId, fecha, hora, estado: 'reservado' });
  }

  cancelar(turnoId: string, pacienteId: string): Turno {
    const turno = this.turnos.buscarPorId(turnoId);
    if (!turno) throw new ErrorNoEncontrado('Turno no encontrado');
    if (turno.pacienteId !== pacienteId) throw new ErrorProhibido('No podés cancelar el turno de otra persona');
    if (!puedeCancelarTurno(turno, this.reloj.ahora())) throw new ErrorConflicto('El turno no se puede cancelar con menos de 24 horas o porque ya pasó');
    const cancelado = this.turnos.actualizar(turnoId, { estado: 'cancelado' });
    if (!cancelado) throw new ErrorNoEncontrado('Turno no encontrado');
    return cancelado;
  }

  misTurnos(pacienteId: string): Turno[] {
    return this.turnos.listar()
      .filter((turno) => turno.pacienteId === pacienteId)
      .sort((primero, segundo) => `${primero.fecha}T${primero.hora}`.localeCompare(`${segundo.fecha}T${segundo.hora}`));
  }

  private buscarMedicoReservable(id: string): Medico {
    const medico = this.medicos.buscarPorId(id);
    if (!medico) throw new ErrorNoEncontrado('Médico no encontrado');
    if (!medico.activo || medico.enLicencia) throw new ErrorConflicto('El médico no está disponible');
    return medico;
  }
}