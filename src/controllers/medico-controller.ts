import { NextFunction, Request, Response, Router } from 'express';
import { autenticar, exigirRol, PeticionAutenticada } from '../middlewares/auth';
import { AuthService } from '../services/auth-service';
import { MedicoService, NuevoMedico } from '../services/medico-service';
import { TurnoService } from '../services/turno-service';

function manejarAsync(controlador: (request: Request, response: Response) => Promise<void> | void) {
  return (request: Request, response: Response, next: NextFunction): void => {
    Promise.resolve(controlador(request, response)).catch(next);
  };
}

export function crearMedicoRouter(medicos: MedicoService, turnos: TurnoService): Router {
  const router = Router();
  router.get('/', (request, response) => {
    const especialidad = typeof request.query.especialidad === 'string' ? request.query.especialidad : undefined;
    response.json(medicos.listar(especialidad));
  });
  router.get('/:id/disponibilidad', manejarAsync((request, response) => {
    const fecha = typeof request.query.fecha === 'string' ? request.query.fecha : '';
    response.json(turnos.disponibilidad(parametroRuta(request.params.id), fecha));
  }));
  return router;
}

export function crearAdminMedicoRouter(medicos: MedicoService, auth: AuthService): Router {
  const router = Router();
  router.use(autenticar(auth), exigirRol('admin'));
  router.post('/', manejarAsync((request, response) => {
    response.status(201).json(medicos.crear(request.body as NuevoMedico));
  }));
  router.put('/:id', manejarAsync((request, response) => {
    response.json(medicos.actualizar(parametroRuta(request.params.id), request.body as Record<string, unknown>));
  }));
  return router;
}

export function identidadDe(request: Request): NonNullable<PeticionAutenticada['identidad']> {
  return (request as PeticionAutenticada).identidad!;
}

function parametroRuta(valor: string | string[]): string {
  return Array.isArray(valor) ? valor[0] : valor;
}