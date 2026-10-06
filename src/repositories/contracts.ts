import { Medico, Turno, Usuario } from '../models/entities';

export interface IUsuarioRepository {
  buscarPorEmail(email: string): Usuario | undefined;
  buscarPorId(id: string): Usuario | undefined;
  crear(usuario: Usuario): Usuario;
  listar(): Usuario[];
  limpiar(): void;
}

export interface IMedicoRepository {
  buscarPorId(id: string): Medico | undefined;
  listar(especialidad?: string): Medico[];
  crear(medico: Medico): Medico;
  actualizar(id: string, cambios: Partial<Medico>): Medico | undefined;
  limpiar(): void;
}

export interface ITurnoRepository {
  buscarPorId(id: string): Turno | undefined;
  listar(): Turno[];
  crear(turno: Turno): Turno;
  actualizar(id: string, cambios: Partial<Turno>): Turno | undefined;
  limpiar(): void;
}