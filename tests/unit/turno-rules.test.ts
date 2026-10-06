import { puedeCancelarTurno } from '../../src/services/turno-rules';
import { generarFranjasLibres } from '../../src/services/disponibilidad-service';

describe('reglas de turnos', () => {
  describe('generarFranjasLibres', () => {
    it('genera franjas de la duración configurada y excluye las ocupadas', () => {
      const franjas = generarFranjasLibres(
        { inicio: '09:00', fin: '11:00' },
        30,
        [{ fecha: '2030-05-06', hora: '09:30', duracionMinutos: 30 }],
        '2030-05-06',
      );

      expect(franjas).toEqual(['09:00', '10:00', '10:30']);
    });

    it('excluye una franja que se solapa aunque no comience en el mismo minuto', () => {
      const franjas = generarFranjasLibres(
        { inicio: '09:00', fin: '10:30' },
        30,
        [{ fecha: '2030-05-06', hora: '09:20', duracionMinutos: 20 }],
        '2030-05-06',
      );

      expect(franjas).toEqual(['10:00']);
    });
  });

  describe('puedeCancelarTurno', () => {
    const ahora = new Date('2030-05-05T09:00:00.000Z');

    it('permite cancelar exactamente con 24 horas de anticipación', () => {
      expect(puedeCancelarTurno({ fecha: '2030-05-06', hora: '09:00', estado: 'reservado' }, ahora)).toBe(true);
    });

    it('rechaza cancelaciones con menos de 24 horas, de turnos pasados o atendidos', () => {
      expect(puedeCancelarTurno({ fecha: '2030-05-06', hora: '08:59', estado: 'reservado' }, ahora)).toBe(false);
      expect(puedeCancelarTurno({ fecha: '2030-05-04', hora: '09:00', estado: 'reservado' }, ahora)).toBe(false);
      expect(puedeCancelarTurno({ fecha: '2030-05-06', hora: '09:00', estado: 'atendido' }, ahora)).toBe(false);
    });
  });
});