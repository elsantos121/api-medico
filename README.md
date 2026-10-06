# Sistema de Turnos Médicos

Backend API REST para que pacientes consulten médicos, reserven y cancelen turnos. Los administradores gestionan médicos, horarios, licencias y estado activo. Los médicos no tienen cuenta ni inicio de sesión.

## Stack

- TypeScript con `strict: true` y Node.js 20 o superior.
- Express 4 para HTTP; `src/app.ts` exporta la aplicación y `src/server.ts` inicia el servidor.
- Repositorios en memoria detrás de interfaces, inyectados manualmente en los servicios.
- bcrypt para hashes de contraseñas y JWT para autenticación.
- Cucumber y Supertest para escenarios BDD; Jest y ts-jest para pruebas unitarias.
- ESLint con `@typescript-eslint`.

## Instalación y ejecución

```sh
npm install
```

Para una instalación reproducible desde `package-lock.json`, también se puede usar `npm ci`.

En desarrollo, el secreto JWT local se genera aleatoriamente al iniciar el proceso. Configurá las variables de administrador para crear el usuario administrador inicial:

```sh
export JWT_SECRET="$(openssl rand -hex 32)"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="una-clave-segura"
npm run dev
```

La API queda disponible en `http://localhost:3000`. Si no se definen `ADMIN_EMAIL` y `ADMIN_PASSWORD`, no se crea ningún administrador de ejecución. Las credenciales `admin@example.com` / `AdminSegura123` se usan únicamente como fixture aislado por los escenarios BDD.

En producción `JWT_SECRET` es obligatorio. Si se omite en desarrollo, se genera un secreto aleatorio distinto en cada arranque, por lo que los tokens anteriores dejan de ser válidos al reiniciar.

La persistencia actual es en memoria: los usuarios, médicos y turnos se pierden al reiniciar el proceso. Las interfaces de repositorio permiten sustituirla por almacenamiento persistente sin trasladar reglas de negocio.

## Comandos

```sh
npm run dev         # Servidor de desarrollo con recarga
npm run build       # Compilación TypeScript a dist/
npm start           # Inicia la versión compilada
npm run lint        # ESLint
npm run test        # Pruebas unitarias con Jest
npm run test:e2e    # Escenarios BDD con Cucumber y Supertest
npm run test:all    # Lint, build, unitarias y BDD
```

Las pruebas unitarias están en `tests/unit/`. Los escenarios Gherkin están en `features/` y sus pasos, World y hooks en `tests/step_definitions/` y `tests/support/`. El hook reinicia los repositorios antes de cada escenario.

## Endpoints

Las rutas protegidas reciben `Authorization: Bearer <JWT>`. El registro acepta `contrasena` (también `password`) y devuelve la cuenta sin el hash. Las respuestas de validación usan JSON con la propiedad `error`.

| Método y ruta | Acceso | Descripción |
| --- | --- | --- |
| `POST /auth/register` | Público | Registra un paciente. Body: `nombre`, `email`, `contrasena`. Devuelve `201`; email existente devuelve `409`. |
| `POST /auth/login` | Público | Inicia sesión. Body: `email`, `contrasena`. Devuelve `200` con `token` y usuario; credenciales inválidas devuelven `401`. |
| `GET /medicos` | Público | Lista médicos activos. Acepta el filtro opcional `?especialidad=Clínica`. |
| `GET /medicos/:id/disponibilidad?fecha=AAAA-MM-DD` | Público | Devuelve las horas disponibles para esa fecha, en orden cronológico. |
| `POST /turnos` | Paciente | Solicita un turno. Body: `medicoId`, `fecha` (`AAAA-MM-DD`), `hora` (`HH:mm`). Devuelve `201`. |
| `DELETE /turnos/:id` | Paciente | Cancela un turno propio con al menos 24 horas de anticipación. |
| `GET /turnos/mios` | Paciente | Lista los turnos propios en orden ascendente por fecha y hora. |
| `POST /admin/medicos` | Administrador | Crea un médico con nombre, especialidad, `horarioLaboral` y `duracionTurnoMinutos`. |
| `PUT /admin/medicos/:id` | Administrador | Actualiza datos, horario, `enLicencia` o `activo` de un médico. |

El horario laboral es un objeto cuyas claves son días en español en minúsculas (`lunes`, `martes`, `miércoles`, `jueves`, `viernes`, `sábado`, `domingo`) y cuyos valores contienen `inicio` y `fin` en formato `HH:mm`. Por ejemplo:

```json
{
  "nombre": "Dra. Sol López",
  "especialidad": "Clínica",
  "horarioLaboral": {
    "lunes": { "inicio": "08:00", "fin": "17:00" },
    "miércoles": { "inicio": "09:00", "fin": "13:00" }
  },
  "duracionTurnoMinutos": 30
}
```

La API responde `400` ante datos o fechas inválidas, `401` ante autenticación ausente o inválida, `403` ante un rol o propietario no autorizado, `404` ante recursos inexistentes y `409` ante conflictos de negocio como email duplicado, horario ocupado o cancelación fuera de plazo.

## Decisiones de diseño basadas en XP

- **TDD/BDD y ciclo Red-Green-Refactor:** los criterios se expresan como escenarios ejecutables; las reglas críticas de disponibilidad, solapamiento y cancelación tienen pruebas unitarias.
- **Diseño simple y YAGNI:** se implementan únicamente los roles, entidades y operaciones del backlog. No hay login de médicos ni endpoints para administrar turnos atendidos.
- **Refactorización continua:** los errores de dominio tienen tipos propios, el middleware centraliza su traducción HTTP y cada servicio concentra reglas del caso de uso.
- **Integración continua:** GitHub Actions corre en cada push y pull request con Node 20, `npm ci`, lint, build, Jest y Cucumber.
- **Pequeñas entregas por historia:** los escenarios se organizan por historia funcional para poder implementar y verificar cada comportamiento por separado.
- **Propiedad colectiva del código:** controllers, services, repositories, models y middlewares tienen límites claros; la aplicación Express puede importarse en tests sin abrir un puerto.

## Alcance y supuestos

- La zona horaria usada para interpretar fecha y hora de turnos es UTC.
- Cada franja laboral diaria es continua y usa intervalos de inicio inclusivo y fin exclusivo para generar turnos de duración fija.
- `GET /medicos` solo expone médicos activos; un médico en licencia no acepta nuevas reservas.
- La implementación no persiste información entre reinicios y no incluye notificaciones, pagos, agenda de feriados ni operaciones para marcar turnos como atendidos.