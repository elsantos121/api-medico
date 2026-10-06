# Backlog: Sistema de Turnos Médicos

## Historias funcionales

### HU-01: Registro de paciente

**Como paciente, quiero registrarme con mis datos para poder solicitar turnos médicos.**

**Criterios de aceptación**
- Dado un nombre, un email válido y una contraseña válida, cuando me registro, entonces se crea una cuenta con rol `paciente` y la contraseña no se almacena en texto plano.
- Dado un email ya registrado, cuando intento registrarme, entonces la API rechaza la operación y no crea otra cuenta.
- Dado que falta un campo obligatorio o el email no tiene un formato válido, cuando intento registrarme, entonces recibo un error de validación claro.

**Definition of Done**
- La validación y creación se implementan en las capas de servicio y repositorio correspondientes.
- Hay pruebas BDD para el alta válida y los errores de validación/email duplicado.
- La contraseña se guarda con bcrypt y el endpoint está documentado.

### HU-02: Inicio de sesión

**Como paciente, quiero iniciar sesión para acceder de forma segura a mis operaciones.**

**Criterios de aceptación**
- Dadas credenciales válidas, cuando inicio sesión, entonces recibo un JWT firmado que identifica al usuario y su rol.
- Dadas credenciales inválidas, cuando inicio sesión, entonces recibo HTTP 401 sin revelar si falló el email o la contraseña.

**Definition of Done**
- La autenticación verifica el hash con bcrypt y firma JWT usando configuración externa.
- Hay pruebas BDD de credenciales válidas e inválidas.
- Los errores se responden sin exponer hashes ni secretos.

### HU-03: Consulta de médicos y disponibilidad

**Como paciente, quiero consultar médicos por especialidad y sus horarios libres para elegir cuándo atenderme.**

**Criterios de aceptación**
- Dada una especialidad, cuando consulto médicos, entonces recibo los médicos activos que coinciden con ella.
- Dado un médico y una fecha válida, cuando consulto disponibilidad, entonces recibo las franjas laborales libres según la duración de turno configurada y excluyo turnos reservados.
- Dado un médico inexistente o una fecha inválida, cuando consulto disponibilidad, entonces recibo un error HTTP apropiado y comprensible.

**Definition of Done**
- La búsqueda y el cálculo de disponibilidad pasan por servicios y repositorios inyectados.
- Hay pruebas BDD y pruebas unitarias del cálculo de franjas libres.
- La respuesta está ordenada cronológicamente y el endpoint está documentado.

### HU-04: Solicitud de turno

**Como paciente, quiero reservar una franja disponible para recibir atención médica.**

**Criterios de aceptación**
- Dado un horario libre y válido, cuando solicito el turno, entonces se crea en estado `reservado`.
- Dado que el horario está ocupado, fuera del horario laboral, en una fecha pasada o el médico está de licencia, cuando intento reservar, entonces la API rechaza la solicitud sin crear el turno.
- Dado que ya tengo un turno con el mismo médico en esa fecha, cuando intento reservar otro, entonces la API rechaza la solicitud.

**Definition of Done**
- Las reglas de negocio se validan en el servicio, usando un reloj inyectable.
- Hay escenarios BDD para reserva exitosa y los límites de horario, licencia, ocupación, pasado y duplicidad diaria.
- Hay pruebas unitarias de solapamiento y validación temporal.

### HU-05: Cancelación de turno

**Como paciente, quiero cancelar un turno futuro con anticipación para liberar el horario.**

**Criterios de aceptación**
- Dado un turno propio reservado con al menos 24 horas de anticipación, cuando lo cancelo, entonces pasa a estado `cancelado` y su franja vuelve a estar disponible.
- Dado un turno con menos de 24 horas, pasado o ya atendido, cuando intento cancelarlo, entonces la API rechaza la operación.
- Dado un turno perteneciente a otro paciente, cuando intento cancelarlo, entonces recibo HTTP 403 y el turno no cambia.

**Definition of Done**
- La propiedad del turno, el estado y el plazo de 24 horas se validan en el servicio con reloj inyectable.
- Hay pruebas BDD de cancelación permitida y de las restricciones principales.
- Hay pruebas unitarias del límite de 24 horas y se confirma que cancelar libera la disponibilidad.

### HU-06: Consulta de mis turnos

**Como paciente, quiero ver mis turnos ordenados por fecha para organizar mi atención.**

**Criterios de aceptación**
- Dado un paciente autenticado, cuando consulto mis turnos, entonces recibo únicamente los turnos asociados a mi usuario.
- Cuando hay varios turnos, entonces se devuelven ordenados por fecha y hora ascendente.

**Definition of Done**
- El endpoint requiere autenticación y obtiene la identidad desde el JWT, no desde parámetros del cliente.
- Hay escenarios BDD que verifican aislamiento entre pacientes y orden cronológico.
- El endpoint está documentado.

### HU-07: Gestión de médicos

**Como administrador, quiero gestionar médicos y sus horarios para mantener actualizada la oferta de atención.**

**Criterios de aceptación**
- Dado un administrador autenticado, cuando crea un médico, entonces puede definir nombre, especialidad, horario laboral por día y duración de turno.
- Dado un médico existente, cuando el administrador actualiza su horario, licencia o estado activo, entonces los cambios se reflejan en las consultas y reservas posteriores.
- Dado un usuario sin rol administrador, cuando intenta crear o modificar un médico, entonces recibe HTTP 403 y no hay cambios.

**Definition of Done**
- Las rutas de escritura de administración requieren autenticación y autorización por rol.
- Hay escenarios BDD para creación, modificación y acceso denegado a pacientes.
- Los datos de horario y duración se validan y los endpoints están documentados.

## Historias técnicas no funcionales

### HT-01: Seguridad de credenciales y autorización

**Como responsable del sistema, quiero proteger credenciales y operaciones privadas para reducir accesos no autorizados.**

**Criterios de aceptación**
- Las contraseñas se persisten únicamente como hashes bcrypt con sal; nunca se devuelven en respuestas HTTP.
- Los JWT se validan en endpoints protegidos y las rutas administrativas exigen rol `admin`.
- Un paciente solo puede consultar o cancelar sus propios turnos.

**Definition of Done**
- Hay middleware reutilizable de autenticación y autorización con errores HTTP consistentes.
- Las pruebas BDD cubren el acceso de roles no autorizados y la privacidad de turnos.
- Los secretos de firma no están hardcodeados y se describen en la documentación de configuración.

### HT-02: Rendimiento y arquitectura reemplazable

**Como equipo de desarrollo, queremos lecturas rápidas y dependencias desacopladas para evolucionar la persistencia sin reescribir las reglas.**

**Criterios de aceptación**
- En el entorno local de referencia, los endpoints de lectura responden en menos de 200 ms para el conjunto de datos de prueba.
- Los servicios dependen de interfaces de repositorio y los repositorios en memoria pueden sustituirse sin cambiar reglas de negocio.
- La aplicación HTTP puede importarse para pruebas sin iniciar el servidor de escucha.

**Definition of Done**
- Controllers, services, repositories, models y middlewares están separados en sus capas previstas.
- La inyección manual por constructor cubre las dependencias de los servicios.
- Hay una verificación reproducible del umbral de lectura y pruebas HTTP ejecutadas contra la app Express.