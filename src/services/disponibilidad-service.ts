import { FranjaLaboral, TurnoOcupado } from '../models/entities';
import { haySolapamiento, minutosDesdeMedianoche } from './turno-rules';

export function generarFranjasLibres(
  horario: FranjaLaboral,
  duracionMinutos: number,
  ocupados: TurnoOcupado[],
  fecha: string,
): string[] {
  const inicio = minutosDesdeMedianoche(horario.inicio);
  const fin = minutosDesdeMedianoche(horario.fin);
  const franjas: string[] = [];

  for (let minuto = inicio; minuto + duracionMinutos <= fin; minuto += duracionMinutos) {
    const hora = `${String(Math.floor(minuto / 60)).padStart(2, '0')}:${String(minuto % 60).padStart(2, '0')}`;
    if (!haySolapamiento(hora, duracionMinutos, ocupados, fecha)) franjas.push(hora);
  }

  return franjas;
}