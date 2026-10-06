# language: es
Característica: Cancelación de turnos
  Como paciente
  Quiero cancelar un turno propio con anticipación
  Para liberar el horario para otra persona

  Antecedentes:
    Dado que existe un médico activo de especialidad "Clínica" con horario de "00:00" a "23:59" y turnos de 30 minutos todos los días

  Escenario: Cancelar un turno con más de 24 horas de anticipación
    Dado que inicié sesión como paciente
    Y tengo un turno reservado dentro de 3 días a las "09:00"
    Cuando cancelo ese turno
    Entonces recibo HTTP 200
    Y el turno queda en estado "cancelado"
    Y la franja queda disponible nuevamente

  Escenario: Rechazo de cancelación con menos de 24 horas
    Dado que inicié sesión como paciente
    Y tengo un turno reservado dentro de 12 horas
    Cuando cancelo ese turno
    Entonces recibo HTTP 409

  Escenario: Rechazo de cancelación de un turno atendido
    Dado que inicié sesión como paciente
    Y tengo un turno atendido dentro de 3 días
    Cuando cancelo ese turno
    Entonces recibo HTTP 409

  Escenario: Un paciente no puede cancelar el turno de otra persona
    Dado que inicié sesión como paciente
    Y existe un turno reservado de otro paciente dentro de 3 días
    Cuando intento cancelar ese turno
    Entonces recibo HTTP 403