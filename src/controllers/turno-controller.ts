import { NextFunction, Request, Response, Router } from 'express';
import { autenticar, exigirRol, PeticionAutenticada } from '../middlewares/auth';
import { AuthService } from '../services/auth-service';
import { TurnoService } from '../services/turno-service';

function manejarAsync(controlador: (request: Request, response: Response) => Promise<void> | void) {
  return (request: Request, response: Response, next: NextFunction): void => {
    Promise.resolve(controlador(request, response)).catch(next);
  };
}

function identidad(request: Request): { id: string; rol: 'paciente' | 'admin' } {
  return (request as PeticionAutenticada).identidad!;
}

export function crearTurnoRouter(turnos: TurnoService, auth: AuthService): Router {
  const router = Router();
  router.use(autenticar(auth), exigirRol('paciente'));
  router.post('/', manejarAsync((request, response) => {
    const cuerpo = request.body as Record<string, unknown>;
    const turno = turnos.reservar(identidad(request).id, cuerpo.medicoId, cuerpo.fecha, cuerpo.hora);
    response.status(201).json(turno);
  }));
  router.delete('/:id', manejarAsync((request, response) => {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    response.json(turnos.cancelar(id, identidad(request).id));
  }));
  router.get('/mios', (request, response) => {
    response.json(turnos.misTurnos(identidad(request).id));
  });
  return router;
}