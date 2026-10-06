import { NextFunction, Request, Response, Router } from 'express';
import { AuthService } from '../services/auth-service';

function manejarAsync(controlador: (request: Request, response: Response) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction): void => {
    void controlador(request, response).catch(next);
  };
}

export function crearAuthRouter(servicio: AuthService): Router {
  const router = Router();
  router.post('/register', manejarAsync(async (request, response) => {
    const cuerpo = request.body as Record<string, unknown>;
    const usuario = await servicio.registrar(cuerpo.nombre, cuerpo.email, cuerpo.contrasena ?? cuerpo.password);
    response.status(201).json(usuario);
  }));
  router.post('/login', manejarAsync(async (request, response) => {
    const cuerpo = request.body as Record<string, unknown>;
    const sesion = await servicio.iniciarSesion(cuerpo.email, cuerpo.contrasena ?? cuerpo.password);
    response.status(200).json({ token: sesion.token, usuario: sesion.usuario });
  }));
  return router;
}