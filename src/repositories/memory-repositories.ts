import { Medico, Turno, Usuario } from '../models/entities';
import { IMedicoRepository, ITurnoRepository, IUsuarioRepository } from './contracts';

export class RepositorioUsuariosMemoria implements IUsuarioRepository {
  private readonly usuarios = new Map<string, Usuario>();

  buscarPorEmail(email: string): Usuario | undefined {
    return [...this.usuarios.values()].find((usuario) => usuario.email === email);
  }

  buscarPorId(id: string): Usuario | undefined {
    return this.usuarios.get(id);
  }

  crear(usuario: Usuario): Usuario {
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  listar(): Usuario[] {
    return [...this.usuarios.values()];
  }

  limpiar(): void {
    this.usuarios.clear();
  }
}

export class RepositorioMedicosMemoria implements IMedicoRepository {
  private readonly medicos = new Map<string, Medico>();

  buscarPorId(id: string): Medico | undefined {
    return this.medicos.get(id);
  }

  listar(especialidad?: string): Medico[] {
    return [...this.medicos.values()].filter((medico) => !especialidad || medico.especialidad.toLowerCase() === especialidad.toLowerCase());
  }

  crear(medico: Medico): Medico {
    this.medicos.set(medico.id, medico);
    return medico;
  }

  actualizar(id: string, cambios: Partial<Medico>): Medico | undefined {
    const medico = this.buscarPorId(id);
    if (!medico) return undefined;
    const actualizado = { ...medico, ...cambios };
    this.medicos.set(id, actualizado);
    return actualizado;
  }

  limpiar(): void {
    this.medicos.clear();
  }
}

export class RepositorioTurnosMemoria implements ITurnoRepository {
  private readonly turnos = new Map<string, Turno>();

  buscarPorId(id: string): Turno | undefined {
    return this.turnos.get(id);
  }

  listar(): Turno[] {
    return [...this.turnos.values()];
  }

  crear(turno: Turno): Turno {
    this.turnos.set(turno.id, turno);
    return turno;
  }

  actualizar(id: string, cambios: Partial<Turno>): Turno | undefined {
    const turno = this.buscarPorId(id);
    if (!turno) return undefined;
    const actualizado = { ...turno, ...cambios };
    this.turnos.set(id, actualizado);
    return actualizado;
  }

  limpiar(): void {
    this.turnos.clear();
  }
}