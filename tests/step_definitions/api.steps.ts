import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { decode } from 'jsonwebtoken';
import { repositorioTurnos } from '../../src/app';
import { TurnosWorld } from '../support/world';

const CLAVE_PRUEBA = 'ClaveSegura123';

function fechaRelativa(expresion: string): { fecha: string; hora?: string } {
  const ahora = new Date();
  const horas = expresion.match(/dentro de (\d+) horas/);
  if (horas) {
    ahora.setTime(ahora.getTime() + Number(horas[1]) * 60 * 60 * 1000);
    return { fecha: ahora.toISOString().slice(0, 10), hora: ahora.toISOString().slice(11, 16) };
  }

  const dias = expresion.match(/dentro de (\d+) días/);
  if (dias) ahora.setDate(ahora.getDate() + Number(dias[1]));
  if (expresion === 'ayer') ahora.setDate(ahora.getDate() - 1);
  return { fecha: ahora.toISOString().slice(0, 10) };
}

async function registrarPaciente(world: TurnosWorld, email: string, contrasena = CLAVE_PRUEBA): Promise<void> {
  world.emailPaciente = email;
  world.contrasenaPaciente = contrasena;
  await world.post('/auth/register', { nombre: 'Ana Pérez', email, contrasena });
}

async function iniciarSesion(world: TurnosWorld, email: string, contrasena: string): Promise<void> {
  await world.post('/auth/login', { email, contrasena });
  const token = world.cuerpo().token;
  if (typeof token === 'string') world.token = token;
}

async function iniciarSesionComo(world: TurnosWorld, rol: 'admin' | 'paciente'): Promise<void> {
  if (rol === 'admin') {
    await iniciarSesion(world, 'admin@example.com', 'AdminSegura123');
    return;
  }

  const email = 'paciente@example.com';
  await registrarPaciente(world, email);
  await iniciarSesion(world, email, CLAVE_PRUEBA);
}

async function crearMedico(world: TurnosWorld, especialidad: string, activo = true): Promise<void> {
  const tokenAnterior = world.token;
  await iniciarSesionComo(world, 'admin');
  await world.post('/admin/medicos', {
    nombre: 'Dra. Sol López',
    especialidad,
    horarioLaboral: Object.fromEntries(
      ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => [dia, { inicio: '08:00', fin: '17:00' }]),
    ),
    duracionTurnoMinutos: 30,
    activo,
    enLicencia: false,
  });
  const id = world.cuerpo().id;
  if (typeof id === 'string') world.medicoId = id;
  if (tokenAnterior) world.token = tokenAnterior;
}

async function crearTurno(world: TurnosWorld, fechaTexto: string, hora?: string): Promise<void> {
  const relativo = fechaRelativa(fechaTexto);
  await world.post('/turnos', {
    medicoId: world.medicoId,
    fecha: relativo.fecha,
    hora: hora ?? relativo.hora ?? '09:00',
  });
  const id = world.cuerpo().id;
  if (typeof id === 'string') world.turnoId = id;
}

Given('que no existe una cuenta con el email {string}', function (this: TurnosWorld, email: string) {
  this.emailPaciente = email;
  assert.ok(this instanceof TurnosWorld);
});

Given('que existe un paciente registrado con email {string}', async function (this: TurnosWorld, email: string) {
  await registrarPaciente(this, email);
});

Given('que existe un paciente registrado con email {string} y contraseña {string}', async function (this: TurnosWorld, email: string, contrasena: string) {
  await registrarPaciente(this, email, contrasena);
});

Given('que inicié sesión como administrador', async function (this: TurnosWorld) {
  await iniciarSesionComo(this, 'admin');
});

Given(/^(?:que )?inicié sesión como paciente$/, async function (this: TurnosWorld) {
  await iniciarSesionComo(this, 'paciente');
});

Given(/^(?:que )?existe un médico activo de especialidad "([^"]+)"$/, async function (this: TurnosWorld, especialidad: string) {
  await crearMedico(this, especialidad);
});

Given(/^(?:que )?existe un médico inactivo de especialidad "([^"]+)"$/, async function (this: TurnosWorld, especialidad: string) {
  await crearMedico(this, especialidad, false);
});

Given(/^(?:que )?existe un médico activo de especialidad "([^"]+)" con horario de "([^"]+)" a "([^"]+)" y turnos de (\d+) minutos todos los días$/, async function (this: TurnosWorld, especialidad: string, inicio: string, fin: string, duracionTexto: string) {
  const duracion = Number(duracionTexto);
  await crearMedico(this, especialidad);
  const tokenAnterior = this.token;
  await iniciarSesionComo(this, 'admin');
  await this.put(`/admin/medicos/${this.medicoId}`, {
    horarioLaboral: Object.fromEntries(
      ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => [dia, { inicio, fin }]),
    ),
    duracionTurnoMinutos: duracion,
  });
  if (tokenAnterior) this.token = tokenAnterior;
});

Given(/^(?:que )?tengo un turno reservado con ese médico dentro de (\d+) días a las "([^"]+)"$/, async function (this: TurnosWorld, diasTexto: string, hora: string) {
  const dias = Number(diasTexto);
  await crearTurno(this, `dentro de ${dias} días`, hora);
});

Given(/^(?:que )?tengo un turno reservado dentro de (\d+) días a las "([^"]+)"(?: con otro médico)?$/, async function (this: TurnosWorld, diasTexto: string, hora: string) {
  const dias = Number(diasTexto);
  const otroMedico = this.turnoId !== 'turno-prueba';
  const medicoOriginal = this.medicoId;
  if (otroMedico) await crearMedico(this, 'Clínica alternativa');
  await crearTurno(this, `dentro de ${dias} días`, hora);
  if (otroMedico) this.medicoId = medicoOriginal;
});

Given(/^(?:que )?tengo un turno reservado dentro de (\d+) horas$/, async function (this: TurnosWorld, horasTexto: string) {
  const horas = Number(horasTexto);
  await crearTurno(this, `dentro de ${horas} horas`);
});

Given(/^(?:que )?tengo un turno atendido dentro de (\d+) días$/, async function (this: TurnosWorld, diasTexto: string) {
  const dias = Number(diasTexto);
  await crearTurno(this, `dentro de ${dias} días`);
  repositorioTurnos.actualizar(this.turnoId, { estado: 'atendido' });
});

Given(/^(?:que )?existe un turno reservado de otro paciente dentro de (\d+) días$/, async function (this: TurnosWorld, diasTexto: string) {
  const dias = Number(diasTexto);
  const emailActual = this.emailPaciente;
  const contrasenaActual = this.contrasenaPaciente;
  const emailAlternativo = 'otro-paciente@example.com';
  await registrarPaciente(this, emailAlternativo);
  await iniciarSesion(this, emailAlternativo, CLAVE_PRUEBA);
  await crearTurno(this, `dentro de ${dias} días`);
  await iniciarSesion(this, emailActual, contrasenaActual);
});

Given('otro paciente tiene un turno reservado dentro de {int} días', async function (this: TurnosWorld, dias: number) {
  const emailActual = this.emailPaciente;
  const contrasenaActual = this.contrasenaPaciente;
  const emailAlternativo = 'otro-paciente@example.com';
  await registrarPaciente(this, emailAlternativo);
  await iniciarSesion(this, emailAlternativo, CLAVE_PRUEBA);
  await crearTurno(this, `dentro de ${dias} días`);
  await iniciarSesion(this, emailActual, contrasenaActual);
});

Given('que el médico está en licencia', async function (this: TurnosWorld) {
  const tokenAnterior = this.token;
  await iniciarSesionComo(this, 'admin');
  await this.put(`/admin/medicos/${this.medicoId}`, { enLicencia: true });
  if (tokenAnterior) this.token = tokenAnterior;
});

When('registro un paciente con nombre {string}, email {string} y contraseña {string}', async function (this: TurnosWorld, nombre: string, email: string, contrasena: string) {
  await this.post('/auth/register', { nombre: nombre === 'vacío' ? '' : nombre, email, contrasena });
});

When('registro un paciente con nombre vacío, email {string} y contraseña {string}', async function (this: TurnosWorld, email: string, contrasena: string) {
  await this.post('/auth/register', { nombre: '', email, contrasena });
});

When('inicio sesión con email {string} y contraseña {string}', async function (this: TurnosWorld, email: string, contrasena: string) {
  await iniciarSesion(this, email, contrasena);
});

When('creo un médico llamado {string} de especialidad {string} con horario de {string} a {string} todos los días y turnos de {int} minutos', async function (this: TurnosWorld, nombre: string, especialidad: string, inicio: string, fin: string, duracion: number) {
  await this.post('/admin/medicos', {
    nombre,
    especialidad,
    horarioLaboral: Object.fromEntries(
      ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => [dia, { inicio, fin }]),
    ),
    duracionTurnoMinutos: duracion,
  });
});

When('marco al médico en licencia', async function (this: TurnosWorld) {
  await this.put(`/admin/medicos/${this.medicoId}`, { enLicencia: true });
});

When('desactivo al médico', async function (this: TurnosWorld) {
  await this.put(`/admin/medicos/${this.medicoId}`, { activo: false });
});

When('intento crear un médico de especialidad {string}', async function (this: TurnosWorld, especialidad: string) {
  await this.post('/admin/medicos', { nombre: 'Médico de prueba', especialidad });
});

When('consulto los médicos de especialidad {string}', async function (this: TurnosWorld, especialidad: string) {
  await this.get(`/medicos?especialidad=${encodeURIComponent(especialidad)}`);
});

When('consulto la disponibilidad de ese médico dentro de {int} días', async function (this: TurnosWorld, dias: number) {
  const { fecha } = fechaRelativa(`dentro de ${dias} días`);
  await this.get(`/medicos/${this.medicoId}/disponibilidad?fecha=${fecha}`);
});

When('consulto la disponibilidad de ese médico con una fecha inválida', async function (this: TurnosWorld) {
  await this.get(`/medicos/${this.medicoId}/disponibilidad?fecha=no-es-fecha`);
});

When('solicito un turno con ese médico dentro de {int} días a las {string}', async function (this: TurnosWorld, dias: number, hora: string) {
  await crearTurno(this, `dentro de ${dias} días`, hora);
});

When('solicito otro turno con ese médico dentro de {int} días a las {string}', async function (this: TurnosWorld, dias: number, hora: string) {
  await crearTurno(this, `dentro de ${dias} días`, hora);
});

When('solicito un turno con ese médico ayer a las {string}', async function (this: TurnosWorld, hora: string) {
  await crearTurno(this, 'ayer', hora);
});

When('cancelo ese turno', async function (this: TurnosWorld) {
  await this.borrar(`/turnos/${this.turnoId}`);
});

When('intento cancelar ese turno', async function (this: TurnosWorld) {
  await this.borrar(`/turnos/${this.turnoId}`);
});

When('consulto mis turnos', async function (this: TurnosWorld) {
  await this.get('/turnos/mios');
});

Then('recibo HTTP {int}', function (this: TurnosWorld, estado: number) {
  assert.ok(this.respuesta, 'No se realizó ninguna solicitud HTTP');
  assert.equal(this.respuesta.status, estado);
});

Then('la respuesta identifica el rol {string}', function (this: TurnosWorld, rol: string) {
  assert.equal(this.cuerpo().rol, rol);
});

Then('la respuesta no contiene una contraseña', function (this: TurnosWorld) {
  assert.equal(JSON.stringify(this.respuesta?.body).includes('ClaveSegura123'), false);
});

Then('recibo un token JWT válido para el rol {string}', function (this: TurnosWorld, rol: string) {
  const token = this.cuerpo().token;
  assert.equal(typeof token, 'string');
  const contenido = decode(String(token));
  assert.ok(contenido && typeof contenido === 'object');
  assert.equal(contenido.rol, rol);
});

Then('la respuesta no revela qué credencial fue incorrecta', function (this: TurnosWorld) {
  assert.equal(JSON.stringify(this.respuesta?.body).includes('email'), false);
  assert.equal(JSON.stringify(this.respuesta?.body).includes('contraseña'), false);
});

Then('el médico aparece activo en la lista de médicos', async function (this: TurnosWorld) {
  await this.get('/medicos');
  const medicos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
  assert.ok(medicos.some((medico) => typeof medico === 'object' && medico !== null && 'id' in medico && medico.id === this.medicoId));
});

Then('el médico no aparece en la lista pública de médicos', async function (this: TurnosWorld) {
  await this.get('/medicos');
  const medicos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
  assert.ok(medicos.every((medico) => typeof medico !== 'object' || medico === null || !('id' in medico) || medico.id !== this.medicoId));
});

Then('la lista contiene solo médicos activos de especialidad {string}', function (this: TurnosWorld, especialidad: string) {
  const lista = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
  assert.ok(lista.length > 0);
  assert.ok(lista.every((medico) => typeof medico === 'object' && medico !== null && 'activo' in medico && medico.activo === true && 'especialidad' in medico && medico.especialidad === especialidad));
});

Then('las franjas disponibles no incluyen las {string}', function (this: TurnosWorld, horaOcupada: string) {
  const cuerpo = this.respuesta?.body;
  const franjas = Array.isArray(cuerpo) ? cuerpo : this.cuerpo().horarios;
  assert.ok(Array.isArray(franjas));
  assert.ok(!franjas.some((franja) => franja === horaOcupada || (typeof franja === 'object' && franja !== null && 'hora' in franja && franja.hora === horaOcupada)));
});

Then('las franjas disponibles están ordenadas por hora', function (this: TurnosWorld) {
  const cuerpo = this.respuesta?.body;
  const franjas = Array.isArray(cuerpo) ? cuerpo : this.cuerpo().horarios;
  assert.ok(Array.isArray(franjas));
  const horas = franjas.map((franja) => typeof franja === 'string' ? franja : typeof franja === 'object' && franja !== null && 'hora' in franja ? String(franja.hora) : '');
  assert.deepEqual(horas, [...horas].sort());
});

Then('el turno queda en estado {string}', function (this: TurnosWorld, estado: string) {
  assert.equal(this.cuerpo().estado, estado);
});

Then('la franja queda disponible nuevamente', async function (this: TurnosWorld) {
  assert.equal(this.cuerpo().estado, 'cancelado');
});

Then('solo veo mis propios turnos', function (this: TurnosWorld) {
  const turnos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
  assert.ok(turnos.every((turno) => typeof turno === 'object' && turno !== null && 'pacienteId' in turno));
});

Then('mis turnos están ordenados por fecha y hora ascendente', function (this: TurnosWorld) {
  const turnos = Array.isArray(this.respuesta?.body) ? this.respuesta.body : [];
  const fechas = turnos.map((turno) => typeof turno === 'object' && turno !== null && 'fecha' in turno ? String(turno.fecha) : '');
  assert.deepEqual(fechas, [...fechas].sort());
});