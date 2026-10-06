# language: es
Característica: Consulta de médicos y disponibilidad
  Como paciente
  Quiero consultar médicos por especialidad y horarios libres
  Para elegir una opción de atención

  Escenario: Consultar médicos por especialidad
    Dado que existe un médico activo de especialidad "Dermatología"
    Y existe un médico inactivo de especialidad "Dermatología"
    Cuando consulto los médicos de especialidad "Dermatología"
    Entonces recibo HTTP 200
    Y la lista contiene solo médicos activos de especialidad "Dermatología"

  Escenario: Consultar franjas libres para una fecha futura
    Dado que inicié sesión como paciente
    Y existe un médico activo de especialidad "Clínica" con horario de "08:00" a "10:00" y turnos de 30 minutos todos los días
    Y tengo un turno reservado con ese médico dentro de 3 días a las "09:00"
    Cuando consulto la disponibilidad de ese médico dentro de 3 días
    Entonces recibo HTTP 200
    Y las franjas disponibles no incluyen las "09:00"
    Y las franjas disponibles están ordenadas por hora

  Escenario: Rechazo de fecha inválida al consultar disponibilidad
    Dado que existe un médico activo de especialidad "Clínica"
    Cuando consulto la disponibilidad de ese médico con una fecha inválida
    Entonces recibo HTTP 400