import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { Usuario } from '../models/entities';
import { ErrorConflicto, ErrorNoAutorizado, ErrorValidacion } from '../models/errors';
import { IUsuarioRepository } from '../repositories/contracts';

export class AuthService {
  constructor(
    private readonly usuarios: IUsuarioRepository,
    private readonly secretoJwt: string,
  ) {}

  async registrar(nombre: unknown, email: unknown, contrasena: unknown): Promise<Omit<Usuario, 'passwordHash'>> {
    if (typeof nombre !== 'string' || !nombre.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ErrorValidacion('Nombre y email válido son obligatorios');
    }
    if (typeof contrasena !== 'string' || contrasena.length < 8) throw new ErrorValidacion('La contraseña debe tener al menos 8 caracteres');
    const emailNormalizado = email.trim().toLowerCase();
    if (this.usuarios.buscarPorEmail(emailNormalizado)) throw new ErrorConflicto('El email ya está registrado');

    const usuario: Usuario = {
      id: randomUUID(),
      nombre: nombre.trim(),
      email: emailNormalizado,
      passwordHash: await bcrypt.hash(contrasena, 10),
      rol: 'paciente',
    };
    this.usuarios.crear(usuario);
    return this.usuarioPublico(usuario);
  }

  async iniciarSesion(email: unknown, contrasena: unknown): Promise<{ token: string; usuario: Omit<Usuario, 'passwordHash'> }> {
    if (typeof email !== 'string' || typeof contrasena !== 'string') throw new ErrorNoAutorizado('Credenciales inválidas');
    const usuario = this.usuarios.buscarPorEmail(email.trim().toLowerCase());
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.passwordHash))) throw new ErrorNoAutorizado('Credenciales inválidas');
    const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, this.secretoJwt, { expiresIn: '8h' });
    return { token, usuario: this.usuarioPublico(usuario) };
  }

  async crearAdministrador(email: string, contrasena: string): Promise<void> {
    if (this.usuarios.buscarPorEmail(email.toLowerCase())) return;
    this.usuarios.crear({
      id: randomUUID(),
      nombre: 'Administrador',
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(contrasena, 10),
      rol: 'admin',
    });
  }

  verificarToken(token: string): { id: string; rol: Usuario['rol'] } {
    try {
      const carga = jwt.verify(token, this.secretoJwt);
      if (typeof carga === 'string' || typeof carga.sub !== 'string' || (carga.rol !== 'admin' && carga.rol !== 'paciente')) throw new ErrorNoAutorizado();
      return { id: carga.sub, rol: carga.rol };
    } catch {
      throw new ErrorNoAutorizado('Token inválido o vencido');
    }
  }

  private usuarioPublico(usuario: Usuario): Omit<Usuario, 'passwordHash'> {
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  }
}