import { NextFunction, Request, Response } from 'express';
import { ErrorNoAutorizado, ErrorProhibido } from '../models/errors';
import { AuthService } from '../services/auth-service';

export interface PeticionAutenticada extends Request {
  identidad?: { id: string; rol: 'paciente' | 'admin' };
}

export function autenticar(auth: AuthService) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const token = request.header('authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return next(new ErrorNoAutorizado());
    try {
      (request as PeticionAutenticada).identidad = auth.verificarToken(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function exigirRol(rol: 'paciente' | 'admin') {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const identidad = (request as PeticionAutenticada).identidad;
    if (!identidad) return next(new ErrorNoAutorizado());
    if (identidad.rol !== rol) return next(new ErrorProhibido());
    next();
  };
}