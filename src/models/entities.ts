export type Rol = 'paciente' | 'admin';
export type EstadoTurno = 'reservado' | 'cancelado' | 'atendido';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
}

export interface FranjaLaboral {
  inicio: string;
  fin: string;
}

export type HorarioLaboral = Partial<Record<string, FranjaLaboral>>;

export interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
  horarioLaboral: HorarioLaboral;
  duracionTurnoMinutos: number;
  activo: boolean;
  enLicencia: boolean;
}

export interface Turno {
  id: string;
  pacienteId: string;
  medicoId: string;
  fecha: string;
  hora: string;
  estado: EstadoTurno;
}

export interface Clock {
  ahora(): Date;
}

export class RelojSistema implements Clock {
  ahora(): Date {
    return new Date();
  }
}

export interface TurnoOcupado {
  fecha: string;
  hora: string;
  duracionMinutos: number;
}