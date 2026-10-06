# language: es
Característica: Consulta de mis turnos
  Como paciente
  Quiero ver mis turnos ordenados por fecha
  Para organizar mi atención médica

  Antecedentes:
    Dado que existe un médico activo de especialidad "Clínica" con horario de "08:00" a "17:00" y turnos de 30 minutos todos los días

  Escenario: Ver mis turnos en orden cronológico
    Dado que inicié sesión como paciente
    Y tengo un turno reservado dentro de 5 días a las "09:00"
    Y tengo un turno reservado dentro de 3 días a las "10:00" con otro médico
    Y otro paciente tiene un turno reservado dentro de 2 días
    Cuando consulto mis turnos
    Entonces recibo HTTP 200
    Y solo veo mis propios turnos
    Y mis turnos están ordenados por fecha y hora ascendente