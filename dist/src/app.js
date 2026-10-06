"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.authService = exports.repositorioTurnos = exports.repositorioMedicos = exports.repositorioUsuarios = void 0;
exports.reiniciarEstado = reiniciarEstado;
exports.prepararAplicacion = prepararAplicacion;
const express_1 = __importDefault(require("express"));
const node_crypto_1 = require("node:crypto");
const auth_controller_1 = require("./controllers/auth-controller");
const medico_controller_1 = require("./controllers/medico-controller");
const turno_controller_1 = require("./controllers/turno-controller");
const error_handler_1 = require("./middlewares/error-handler");
const entities_1 = require("./models/entities");
const memory_repositories_1 = require("./repositories/memory-repositories");
const auth_service_1 = require("./services/auth-service");
const medico_service_1 = require("./services/medico-service");
const turno_service_1 = require("./services/turno-service");
exports.repositorioUsuarios = new memory_repositories_1.RepositorioUsuariosMemoria();
exports.repositorioMedicos = new memory_repositories_1.RepositorioMedicosMemoria();
exports.repositorioTurnos = new memory_repositories_1.RepositorioTurnosMemoria();
const secretoJwt = process.env.JWT_SECRET ?? (0, node_crypto_1.randomBytes)(32).toString('hex');
exports.authService = new auth_service_1.AuthService(exports.repositorioUsuarios, secretoJwt);
const medicoService = new medico_service_1.MedicoService(exports.repositorioMedicos);
const turnoService = new turno_service_1.TurnoService(exports.repositorioTurnos, exports.repositorioMedicos, new entities_1.RelojSistema());
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use('/auth', (0, auth_controller_1.crearAuthRouter)(exports.authService));
exports.app.use('/medicos', (0, medico_controller_1.crearMedicoRouter)(medicoService, turnoService));
exports.app.use('/admin/medicos', (0, medico_controller_1.crearAdminMedicoRouter)(medicoService, exports.authService));
exports.app.use('/turnos', (0, turno_controller_1.crearTurnoRouter)(turnoService, exports.authService));
exports.app.use(error_handler_1.manejarErrores);
async function reiniciarEstado() {
    exports.repositorioUsuarios.limpiar();
    exports.repositorioMedicos.limpiar();
    exports.repositorioTurnos.limpiar();
    await exports.authService.crearAdministrador('admin@example.com', 'AdminSegura123');
}
async function prepararAplicacion() {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET es obligatorio en producción');
    }
    const email = process.env.ADMIN_EMAIL;
    const contrasena = process.env.ADMIN_PASSWORD;
    if (email && contrasena)
        await exports.authService.crearAdministrador(email, contrasena);
}
exports.default = exports.app;
