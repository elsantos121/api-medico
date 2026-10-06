# language: es
Característica: Solicitud de turnos
  Como paciente
  Quiero reservar una franja disponible
  Para recibir atención médica

  Antecedentes:
    Dado que inicié sesión como paciente
    Y existe un médico activo de especialidad "Clínica" con horario de "08:00" a "17:00" y turnos de 30 minutos todos los días

  Escenario: Reservar una franja disponible
    Cuando solicito un turno con ese médico dentro de 3 días a las "09:00"
    Entonces recibo HTTP 201
    Y el turno queda en estado "reservado"

  Escenario: Rechazo de una franja ocupada
    Dado que tengo un turno reservado con ese médico dentro de 3 días a las "09:00"
    Cuando solicito un turno con ese médico dentro de 3 días a las "09:00"
    Entonces recibo HTTP 409

  Escenario: Rechazo de un horario fuera de la jornada laboral
    Cuando solicito un turno con ese médico dentro de 3 días a las "18:00"
    Entonces recibo HTTP 400

  Escenario: Rechazo de un médico en licencia
    Dado que el médico está en licencia
    Cuando solicito un turno con ese médico dentro de 3 días a las "09:00"
    Entonces recibo HTTP 409

  Escenario: Rechazo de una fecha pasada
    Cuando solicito un turno con ese médico ayer a las "09:00"
    Entonces recibo HTTP 400

  Escenario: El paciente no puede reservar dos turnos con el mismo médico en un día
    Dado que tengo un turno reservado con ese médico dentro de 3 días a las "09:00"
    Cuando solicito otro turno con ese médico dentro de 3 días a las "10:00"
    Entonces recibo HTTP 409