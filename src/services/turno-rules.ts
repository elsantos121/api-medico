import { Turno } from '../models/entities';

export function fechaHora(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00.000Z`);
}

export function puedeCancelarTurno(turno: Pick<Turno, 'fecha' | 'hora' | 'estado'>, ahora: Date): boolean {
  if (turno.estado !== 'reservado') return false;
  const inicioTurno = fechaHora(turno.fecha, turno.hora);
  return inicioTurno.getTime() - ahora.getTime() >= 24 * 60 * 60 * 1000;
}

export function haySolapamiento(
  inicio: string,
  duracionMinutos: number,
  ocupados: Array<{ fecha: string; hora: string; duracionMinutos: number }>,
  fecha: string,
): boolean {
  const inicioMinutos = minutosDesdeMedianoche(inicio);
  const finMinutos = inicioMinutos + duracionMinutos;
  return ocupados.some((ocupado) => {
    if (ocupado.fecha !== fecha) return false;
    const ocupadoInicio = minutosDesdeMedianoche(ocupado.hora);
    const ocupadoFin = ocupadoInicio + ocupado.duracionMinutos;
    return inicioMinutos < ocupadoFin && ocupadoInicio < finMinutos;
  });
}

export function minutosDesdeMedianoche(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}