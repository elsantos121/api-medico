import { ErrorRequestHandler } from 'express';
import { ErrorDominio } from '../models/errors';

export const manejarErrores: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;
  if (error instanceof ErrorDominio) {
    response.status(error.estadoHttp).json({ error: error.message });
    return;
  }
  response.status(500).json({ error: 'Error interno del servidor' });
};