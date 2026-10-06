"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fechaHora = fechaHora;
exports.puedeCancelarTurno = puedeCancelarTurno;
exports.haySolapamiento = haySolapamiento;
exports.minutosDesdeMedianoche = minutosDesdeMedianoche;
function fechaHora(fecha, hora) {
    return new Date(`${fecha}T${hora}:00.000Z`);
}
function puedeCancelarTurno(turno, ahora) {
    if (turno.estado !== 'reservado')
        return false;
    const inicioTurno = fechaHora(turno.fecha, turno.hora);
    return inicioTurno.getTime() - ahora.getTime() >= 24 * 60 * 60 * 1000;
}
function haySolapamiento(inicio, duracionMinutos, ocupados, fecha) {
    const inicioMinutos = minutosDesdeMedianoche(inicio);
    const finMinutos = inicioMinutos + duracionMinutos;
    return ocupados.some((ocupado) => {
        if (ocupado.fecha !== fecha)
            return false;
        const ocupadoInicio = minutosDesdeMedianoche(ocupado.hora);
        const ocupadoFin = ocupadoInicio + ocupado.duracionMinutos;
        return inicioMinutos < ocupadoFin && ocupadoInicio < finMinutos;
    });
}
function minutosDesdeMedianoche(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
}
