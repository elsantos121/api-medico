import { randomUUID } from 'node:crypto';
import { HorarioLaboral, Medico } from '../models/entities';
import { ErrorNoEncontrado, ErrorValidacion } from '../models/errors';
import { IMedicoRepository } from '../repositories/contracts';

export interface NuevoMedico {
  nombre: unknown;
  especialidad: unknown;
  horarioLaboral: unknown;
  duracionTurnoMinutos: unknown;
}

export class MedicoService {
  constructor(private readonly medicos: IMedicoRepository) {}

  listar(especialidad?: string): Medico[] {
    return this.medicos.listar(especialidad).filter((medico) => medico.activo);
  }

  buscar(id: string): Medico {
    const medico = this.medicos.buscarPorId(id);
    if (!medico) throw new ErrorNoEncontrado('Médico no encontrado');
    return medico;
  }

  crear(datos: NuevoMedico): Medico {
    const validado = this.validarDatos(datos);
    return this.medicos.crear({ id: randomUUID(), ...validado, activo: true, enLicencia: false });
  }

  actualizar(id: string, cambios: Record<string, unknown>): Medico {
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
    if (!actualizado) throw new ErrorNoEncontrado('Médico no encontrado');
    return actualizado;
  }

  private validarDatos(datos: NuevoMedico): Pick<Medico, 'nombre' | 'especialidad' | 'horarioLaboral' | 'duracionTurnoMinutos'> {
    if (typeof datos.nombre !== 'string' || !datos.nombre.trim() || typeof datos.especialidad !== 'string' || !datos.especialidad.trim()) {
      throw new ErrorValidacion('Nombre y especialidad son obligatorios');
    }
    if (!Number.isInteger(datos.duracionTurnoMinutos) || Number(datos.duracionTurnoMinutos) <= 0) {
      throw new ErrorValidacion('La duración del turno debe ser un entero positivo');
    }
    if (typeof datos.horarioLaboral !== 'object' || datos.horarioLaboral === null || Array.isArray(datos.horarioLaboral)) {
      throw new ErrorValidacion('El horario laboral no es válido');
    }
    const horario = datos.horarioLaboral as HorarioLaboral;
    for (const franja of Object.values(horario)) {
      if (!franja || !/^\d{2}:\d{2}$/.test(franja.inicio) || !/^\d{2}:\d{2}$/.test(franja.fin) || franja.inicio >= franja.fin) {
        throw new ErrorValidacion('Cada franja laboral debe tener inicio y fin válidos');
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