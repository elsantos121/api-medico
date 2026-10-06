# language: es
Característica: Registro de pacientes
  Como paciente
  Quiero crear una cuenta
  Para poder solicitar turnos médicos

  Escenario: Registro exitoso
    Dado que no existe una cuenta con el email "ana@example.com"
    Cuando registro un paciente con nombre "Ana Pérez", email "ana@example.com" y contraseña "ClaveSegura123"
    Entonces recibo HTTP 201
    Y la respuesta identifica el rol "paciente"
    Y la respuesta no contiene una contraseña

  Escenario: Rechazo de un email duplicado
    Dado que existe un paciente registrado con email "ana@example.com"
    Cuando registro un paciente con nombre "Ana Pérez", email "ana@example.com" y contraseña "ClaveSegura123"
    Entonces recibo HTTP 409

  Escenario: Rechazo de campos inválidos
    Dado que no existe una cuenta con el email "invalido"
    Cuando registro un paciente con nombre vacío, email "invalido" y contraseña "corta"
    Entonces recibo HTTP 400