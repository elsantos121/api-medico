"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarFranjasLibres = generarFranjasLibres;
const turno_rules_1 = require("./turno-rules");
function generarFranjasLibres(horario, duracionMinutos, ocupados, fecha) {
    const inicio = (0, turno_rules_1.minutosDesdeMedianoche)(horario.inicio);
    const fin = (0, turno_rules_1.minutosDesdeMedianoche)(horario.fin);
    const franjas = [];
    for (let minuto = inicio; minuto + duracionMinutos <= fin; minuto += duracionMinutos) {
        const hora = `${String(Math.floor(minuto / 60)).padStart(2, '0')}:${String(minuto % 60).padStart(2, '0')}`;
        if (!(0, turno_rules_1.haySolapamiento)(hora, duracionMinutos, ocupados, fecha))
            franjas.push(hora);
    }
    return franjas;
}
