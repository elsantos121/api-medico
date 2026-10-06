import express, { Express } from 'express';
import { randomBytes } from 'node:crypto';
import { crearAuthRouter } from './controllers/auth-controller';
import { crearAdminMedicoRouter, crearMedicoRouter } from './controllers/medico-controller';
import { crearTurnoRouter } from './controllers/turno-controller';
import { manejarErrores } from './middlewares/error-handler';
import { RelojSistema } from './models/entities';
import { RepositorioMedicosMemoria, RepositorioTurnosMemoria, RepositorioUsuariosMemoria } from './repositories/memory-repositories';
import { AuthService } from './services/auth-service';
import { MedicoService } from './services/medico-service';
import { TurnoService } from './services/turno-service';

export const repositorioUsuarios = new RepositorioUsuariosMemoria();
export const repositorioMedicos = new RepositorioMedicosMemoria();
export const repositorioTurnos = new RepositorioTurnosMemoria();
const secretoJwt = process.env.JWT_SECRET ?? randomBytes(32).toString('hex');
export const authService = new AuthService(repositorioUsuarios, secretoJwt);
const medicoService = new MedicoService(repositorioMedicos);
const turnoService = new TurnoService(repositorioTurnos, repositorioMedicos, new RelojSistema());

export const app: Express = express();
app.use(express.json());
app.use('/auth', crearAuthRouter(authService));
app.use('/medicos', crearMedicoRouter(medicoService, turnoService));
app.use('/admin/medicos', crearAdminMedicoRouter(medicoService, authService));
app.use('/turnos', crearTurnoRouter(turnoService, authService));
app.use(manejarErrores);

export async function reiniciarEstado(): Promise<void> {
  repositorioUsuarios.limpiar();
  repositorioMedicos.limpiar();
  repositorioTurnos.limpiar();
  await authService.crearAdministrador('admin@example.com', 'AdminSegura123');
}

export async function prepararAplicacion(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }
  const email = process.env.ADMIN_EMAIL;
  const contrasena = process.env.ADMIN_PASSWORD;
  if (email && contrasena) await authService.crearAdministrador(email, contrasena);
}

export default app;