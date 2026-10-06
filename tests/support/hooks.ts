import { Before } from '@cucumber/cucumber';
import { reiniciarEstado } from '../../src/app';
import { TurnosWorld } from './world';

Before(async function (this: TurnosWorld) {
  await reiniciarEstado();
  this.respuesta = undefined;
  this.token = '';
  this.emailPaciente = '';
  this.contrasenaPaciente = '';
  this.medicoId = 'medico-prueba';
  this.turnoId = 'turno-prueba';
});