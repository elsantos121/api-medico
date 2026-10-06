# language: es
Característica: Inicio de sesión
  Como paciente
  Quiero iniciar sesión
  Para acceder de forma segura a mis operaciones

  Escenario: Inicio de sesión con credenciales válidas
    Dado que existe un paciente registrado con email "ana@example.com" y contraseña "ClaveSegura123"
    Cuando inicio sesión con email "ana@example.com" y contraseña "ClaveSegura123"
    Entonces recibo HTTP 200
    Y recibo un token JWT válido para el rol "paciente"

  Escenario: Rechazo de credenciales inválidas
    Dado que existe un paciente registrado con email "ana@example.com" y contraseña "ClaveSegura123"
    Cuando inicio sesión con email "ana@example.com" y contraseña "incorrecta"
    Entonces recibo HTTP 401
    Y la respuesta no revela qué credencial fue incorrecta