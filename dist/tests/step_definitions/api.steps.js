"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const cucumber_1 = require("@cucumber/cucumber");
const jsonwebtoken_1 = require("jsonwebtoken");
const app_1 = require("../../src/app");
const world_1 = require("../support/world");
const CLAVE_PRUEBA = 'ClaveSegura123';
function fechaRelativa(expresion) {
    const ahora = new Date();
    const horas = expresion.match(/dentro de (\d+) horas/);
    if (horas) {
        ahora.setTime(ahora.getTime() + Number(horas[1]) * 60 * 60 * 1000);
        return { fecha: ahora.toISOString().slice(0, 10), hora: ahora.toISOString().slice(11, 16) };
    }
    const dias = expresion.match(/dentro de (\d+) días/);
    if (dias)
        ahora.setDate(ahora.getDate() + Number(dias[1]));
    if (expresion === 'ayer')
        ahora.setDate(ahora.getDate() - 1);
    return { fecha: ahora.toISOString().slice(0, 10) };
}
async function registrarPaciente(world, email, contrasena = CLAVE_PRUEBA) {
    world.emailPaciente = email;
    world.contrasenaPaciente = contrasena;
    await world.post('/auth/register', { nombre: 'Ana Pérez', email, contrasena });
}
async function iniciarSesion(world, email, contrasena) {
    await world.post('/auth/login', { email, contrasena });
    const token = world.cuerpo().token;
    if (typeof token === 'string')
        world.token = token;
}
async function iniciarSesionComo(world, rol) {
    if (rol === 'admin') {
        await iniciarSesion(world, 'admin@example.com', 'AdminSegura123');
        return;
    }
    const email = 'paciente@example.com';
    await registrarPaciente(world, email);
    await iniciarSesion(world, email, CLAVE_PRUEBA);
}
async function crearMedico(world, especialidad, activo = true) {
    const tokenAnterior = world.token;
    await iniciarSesionComo(world, 'admin');
    await world.post('/admin/medicos', {
        nombre: 'Dra. Sol López',
        especialidad,
        horarioLaboral: Object.fromEntries(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => [dia, { inicio: '08:00', fin: '17:00' }])),
        duracionTurnoMinutos: 30,
        activo,
        enLicencia: false,
    });
    const id = world.cuerpo().id;
    if (typeof id === 'string')
        world.medicoId = id;
    if (tokenAnterior)
        world.token = tokenAnterior;
}
async function crearTurno(world, fechaTexto, hora) {
    const relativo = fechaRelativa(fechaTexto);
    await world.post('/turnos', {
        medicoId: world.medicoId,
        fecha: relativo.fecha,
        hora: hora ?? relativo.hora ?? '09:00',
    });
    const id = world.cuerpo().id;
    if (typeof id === 'string')
        world.turnoId = id;
}
(0, cucumber_1.Given)('que no existe una cuenta con el email {string}', function (email) {
    this.emailPaciente = email;
    strict_1.default.ok(this instanceof world_1.TurnosWorld);
});
(0, cucumber_1.Given)('que existe un paciente registrado con email {string}', async function (email) {
    await registrarPaciente(this, email);
});
(0, cucumber_1.Given)('que existe un paciente registrado con email {string} y contraseña {string}', async function (email, contrasena) {
    await registrarPaciente(this, email, contrasena);
});
(0, cucumber_1.Given)('que inicié sesión como administrador', async function () {
    await iniciarSesionComo(this, 'admin');
});
(0, cucumber_1.Given)(/^(?:que )?inicié sesión como paciente$/, async function () {
    await iniciarSesionComo(this, 'paciente');
});
(0, cucumber_1.Given)(/^(?:que )?existe un médico activo de especialidad "([^"]+)"$/, async function (especialidad) {
    await crearMedico(this, especialidad);
});
(0, cucumber_1.Given)(/^(?:que )?existe un médico inactivo de especialidad "([^"]+)"$/, async function (especialidad) {
    await crearMedico(this, especialidad, false);
});
(0, cucumber_1.Given)(/^(?:que )?existe un médico activo de especialidad "([^"]+)" con horario de "([^"]+)" a "([^"]+)" y turnos de (\d+) minutos todos los días$/, async function (especialidad, inicio, fin, duracionTexto) {
    const duracion = Number(duracionTexto);
    await crearMedico(this, especialidad);
    const tokenAnterior = this.token;
    await iniciarSesionComo(this, 'admin');
    await this.put(`/admin/medicos/${this.medicoId}`, {
        horarioLaboral: Object.fromEntries(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => [dia, { inicio, fin }])),
        duracionTurnoMinutos: duracion,
    });
    if (tokenAnterior)
        this.token = tokenAnterior;
});
(0, cucumber_1.Given)(/^(?:que )?tengo un turno reservado con ese médico dentro de (\d+) días a las "([^"]+)"$/, async function (diasTexto, hora) {
    const dias = Number(diasTexto);
    await crearTurno(this, `dentro de ${dias} días`, hora);
});
(0, cucumber_1.Given)(/^(?:que )?tengo un turno reservado dentro de (\d+) días a las "([^"]+)"(?: con otro médico)?$/, async function (diasTexto, hora) {
    const dias = Number(diasTexto);
    const otroMedico = this.turnoId !== 'turno-prueba';
    const medicoOriginal = this.medicoId;
    if (otroMedico)
        await crearMedico(this, 'Clínica alternativa');
    await crearTurno(this, `dentro de ${dias} días`, hora);
    if (otroMedico)
        this.medicoId = medicoOriginal;
});
(0, cucumber_1.Given)(/^(?:que )?tengo un turno reservado dentro de (\d+) horas$/, async function (horasTexto) {
    const horas = Number(horasTexto);
    await crearTurno(this, `dentro de ${horas} horas`);
});
(0, cucumber_1.Given)(/^(?:que )?tengo un turno atendido dentro de (\d+) días$/, async function (diasTexto) {
    const dias = Number(diasTexto);
    await crearTurno(this, `dentro de ${dias} días`);
    app_1.repositorioTurnos.actualizar(this.turnoId, { estado: 'atendido' });
});
(0, cucumber_1.Given)(/^(?:que )?existe un turno reservado de otro paciente dentro de (\d+) días$/, async function (diasTexto) {
    const dias = Number(diasTexto);
    const emailActual = this.emailPaciente;
    const contrasenaActual = this.contrasenaPaciente;
    const emailAlternativo = 'otro-paciente@example.com';
    await registrarPaciente(this, emailAlternativo);
    await iniciarSesion(this, emailAlternativo, CLAVE_PRUEBA);
    await crearTurno(this, `dentro de ${dias} días`);
    await iniciarSesion(this, emailActual, contrasenaActual);
});
(0, cucumber_1.Given)('otro paciente tiene un turno reservado dentro de {int} días', async function (dias) {
    const emailActual = this.emailPaciente;
    const contrasenaActual = this.contrasenaPaciente;
    const emailAlternativo = 'otro-paciente@example.com';
    await registrarPaciente(this, emailAlternativo);
    await iniciarSesion(this, emailAlternativo, CLAVE_PRUEBA);
    await crearTurno(this, `dentro de ${dias} días`);
    await iniciarSesion(this, emailActual, contrasenaActual);
});
(0, cucumber_1.Given)('que el médico está en licencia', async function () {
    const tokenAnterior = this.token;
    await iniciarSesionComo(this, 'admin');
    await this.put(`/admin/medicos/${this.medicoId}`, { enLicencia: true });
    if (tokenAnterior)
        this.token = tokenAnterior;
});
(0, cucumber_1.When)('registro un paciente con nombre {string}, email {string} y contraseña {string}', async function (nombre, email, contrasena) {
    await this.post('/auth/register', { nombre: nombre === 'vacío' ? '' : nombre, email, contrasena });
});
(0, cucumber_1.When)('registro un paciente con nombre vacío, email {string} y contraseña {string}', async function (email, contrasena) {
    await this.post('/auth/register', { nombre: '', email, contrasena });
});
(0, cucumber_1.When)('inicio sesión con email {string} y contraseña {string}', async function (email, contrasena) {
    await iniciarSesion(this, email, contrasena);
});
(0, cucumber_1.When)('creo un médico llamado {string} de especialidad {string} con horario de {string} a {string} todos los días y turnos de {int} minutos', async function (nombre, especialidad, inicio, fin, duracion) {
    await this.post('/admin/medicos', {
        nombre,
        especialidad,
        horarioLaboral: Object.fromEntries(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => [dia, { inicio, fin }])),
        duracionTurnoMinutos: duracion,
    });
});
(0, cucumber_1.When)('marco al médico en licencia', async function () {
    await this.put(`/admin/medicos/${this.medicoId}`, { enLicencia: true });
});
(0, cucumber_1.When)('desactivo al médico', async function () {
    await this.put(`/admin/medicos/${this.medicoId}`, { activo: false });
});
(0, cucumber_1.When)('intento crear un médico de especialidad {string}', async function (especialidad) {
    await this.post('/admin/medicos', { nombre: 'Médico de prueba', especialidad });
});
(0, cucumber_1.When)('consulto los médicos de especialidad {string}', async function (especialidad) {
    await this.get(`/medicos?especialidad=${encodeURIComponent(especialidad)}`);
});
(0, cucumber_1.When)('consulto la disponibilidad de ese médico dentro de {int} días', async function (dias) {
    const { fecha } = fechaRelativa(`dentro de ${dias} días`);
    await this.get(`/medicos/${this.medicoId}/disponibilidad?fecha=${fecha}`);
});
(0, cucumber_1.When)('consulto la disponibilidad de ese médico con una fecha inválida', async function () {
    await this.get(`/medicos/${this.medicoId}/disponibilidad?fecha=no-es-fecha`);
});
(0, cucumber_1.When)('solicito un turno con ese médico dentro de {int} días a las {string}', async function (dias, hora) {
    await crearTurno(this, `dentro de ${dias} días`, hora);
});
(0, cucumber_1.When)('solicito otro turno con ese médico dentro de {int} días a las {string}', async function (dias, hora) {
    await crearTurno(this, `dentro de ${dias} días`, hora);
});
(0, cucumber_1.When)('solicito un turno con ese médico ayer a las {string}', async function (hora) {
    await crearTurno(this, 'ayer', hora);
});
(0, cucumber_1.When)('cancelo ese turno', async function () {
    await this.borrar(`/turnos/${this.turnoId}`);
});
(0, cucumber_1.When)('intento cancelar ese turno', async function () {
    await this.borrar(`/turnos/${this.turnoId}`);
});
(0, cucumber_1.When)('consulto mis turnos', async function () {
    await this.get('/turnos/mios');
});
(0, cucumber_1.Then)('recibo HTTP {int}', function (estado) {
    strict_1.default.ok(this.respuesta, 'No se realizó ninguna solicitud HTTP');
    strict_1.default.equal(this.respuesta.status, estado);
});
(0, cucumber_1.Then)('la respuesta identifica el rol {string}', function (rol) {
    strict_1.default.equal(this.cuerpo().rol, rol);
});
(0, cucumber_1.Then)('la respuesta no contiene una contraseña', function () {
    strict_1.default.equal(JSON.stringify(this.respuesta?.body).includes('ClaveSegura123'), false);
});
(0, cucumber_1.Then)('recibo un token JWT válido para el rol {string}', function (rol) {
    const token = this.cuerpo().token;
    strict_1.default.equal(typeof token, 'string');
    const contenido = (0, jsonwebtoken_1.decode)(String(token));
    strict_1.default.ok(contenido && typeof contenido === 'object');
    strict_1.default.equal(contenido.rol, rol);
});
(0, cucumber_1.Then)('la respuesta no revela qué credencial fue incorrecta', function () {
    strict_1.default.equal(JSON.stringify(this.respuesta?.body).includes('email'), false);
    strict_1.default.equal(JSON.stringify(this.respuesta?.body).includes('contraseña'), false);
});
(0, cucumber_1.Then)('el médico aparece activo en la lista de médicos', async function () {
    await this.get('/medicos');
    const medicos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
    strict_1.default.ok(medicos.some((medico) => typeof medico === 'object' && medico !== null && 'id' in medico && medico.id === this.medicoId));
});
(0, cucumber_1.Then)('el médico no aparece en la lista pública de médicos', async function () {
    await this.get('/medicos');
    const medicos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
    strict_1.default.ok(medicos.every((medico) => typeof medico !== 'object' || medico === null || !('id' in medico) || medico.id !== this.medicoId));
});
(0, cucumber_1.Then)('la lista contiene solo médicos activos de especialidad {string}', function (especialidad) {
    const lista = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
    strict_1.default.ok(lista.length > 0);
    strict_1.default.ok(lista.every((medico) => typeof medico === 'object' && medico !== null && 'activo' in medico && medico.activo === true && 'especialidad' in medico && medico.especialidad === especialidad));
});
(0, cucumber_1.Then)('las franjas disponibles no incluyen las {string}', function (horaOcupada) {
    const cuerpo = this.respuesta?.body;
    const franjas = Array.isArray(cuerpo) ? cuerpo : this.cuerpo().horarios;
    strict_1.default.ok(Array.isArray(franjas));
    strict_1.default.ok(!franjas.some((franja) => franja === horaOcupada || (typeof franja === 'object' && franja !== null && 'hora' in franja && franja.hora === horaOcupada)));
});
(0, cucumber_1.Then)('las franjas disponibles están ordenadas por hora', function () {
    const cuerpo = this.respuesta?.body;
    const franjas = Array.isArray(cuerpo) ? cuerpo : this.cuerpo().horarios;
    strict_1.default.ok(Array.isArray(franjas));
    const horas = franjas.map((franja) => typeof franja === 'string' ? franja : typeof franja === 'object' && franja !== null && 'hora' in franja ? String(franja.hora) : '');
    strict_1.default.deepEqual(horas, [...horas].sort());
});
(0, cucumber_1.Then)('el turno queda en estado {string}', function (estado) {
    strict_1.default.equal(this.cuerpo().estado, estado);
});
(0, cucumber_1.Then)('la franja queda disponible nuevamente', async function () {
    strict_1.default.equal(this.cuerpo().estado, 'cancelado');
});
(0, cucumber_1.Then)('solo veo mis propios turnos', function () {
    const turnos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
    strict_1.default.ok(turnos.every((turno) => typeof turno === 'object' && turno !== null && 'pacienteId' in turno));
});
(0, cucumber_1.Then)('mis turnos están ordenados por fecha y hora ascendente', function () {
    const turnos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
    const fechas = turnos.map((turno) => typeof turno === 'object' && turno !== null && 'fecha' in turno ? String(turno.fecha) : '');
    strict_1.default.deepEqual(fechas, [...fechas].sort());
});
