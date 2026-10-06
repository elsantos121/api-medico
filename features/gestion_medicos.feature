# language: es
Característica: Gestión de médicos
  Como administrador
  Quiero crear y actualizar médicos
  Para mantener disponible la oferta de atención

  Escenario: El administrador crea un médico con horario laboral
    Dado que inicié sesión como administrador
    Cuando creo un médico llamado "Dra. Sol López" de especialidad "Clínica" con horario de "08:00" a "17:00" todos los días y turnos de 30 minutos
    Entonces recibo HTTP 201
    Y el médico aparece activo en la lista de médicos

  Escenario: El administrador marca un médico en licencia y luego lo reactiva
    Dado que inicié sesión como administrador
    Y existe un médico activo de especialidad "Cardiología"
    Cuando marco al médico en licencia
    Entonces recibo HTTP 200
    Cuando desactivo al médico
    Entonces recibo HTTP 200
    Y el médico no aparece en la lista pública de médicos

  Escenario: Un paciente no puede crear médicos
    Dado que inicié sesión como paciente
    Cuando intento crear un médico de especialidad "Clínica"
    Entonces recibo HTTP 403