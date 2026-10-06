"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = require("node:crypto");
const errors_1 = require("../models/errors");
class AuthService {
    usuarios;
    secretoJwt;
    constructor(usuarios, secretoJwt) {
        this.usuarios = usuarios;
        this.secretoJwt = secretoJwt;
    }
    async registrar(nombre, email, contrasena) {
        if (typeof nombre !== 'string' || !nombre.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new errors_1.ErrorValidacion('Nombre y email válido son obligatorios');
        }
        if (typeof contrasena !== 'string' || contrasena.length < 8)
            throw new errors_1.ErrorValidacion('La contraseña debe tener al menos 8 caracteres');
        const emailNormalizado = email.trim().toLowerCase();
        if (this.usuarios.buscarPorEmail(emailNormalizado))
            throw new errors_1.ErrorConflicto('El email ya está registrado');
        const usuario = {
            id: (0, node_crypto_1.randomUUID)(),
            nombre: nombre.trim(),
            email: emailNormalizado,
            passwordHash: await bcrypt_1.default.hash(contrasena, 10),
            rol: 'paciente',
        };
        this.usuarios.crear(usuario);
        return this.usuarioPublico(usuario);
    }
    async iniciarSesion(email, contrasena) {
        if (typeof email !== 'string' || typeof contrasena !== 'string')
            throw new errors_1.ErrorNoAutorizado('Credenciales inválidas');
        const usuario = this.usuarios.buscarPorEmail(email.trim().toLowerCase());
        if (!usuario || !(await bcrypt_1.default.compare(contrasena, usuario.passwordHash)))
            throw new errors_1.ErrorNoAutorizado('Credenciales inválidas');
        const token = jsonwebtoken_1.default.sign({ sub: usuario.id, rol: usuario.rol }, this.secretoJwt, { expiresIn: '8h' });
        return { token, usuario: this.usuarioPublico(usuario) };
    }
    async crearAdministrador(email, contrasena) {
        if (this.usuarios.buscarPorEmail(email.toLowerCase()))
            return;
        this.usuarios.crear({
            id: (0, node_crypto_1.randomUUID)(),
            nombre: 'Administrador',
            email: email.toLowerCase(),
            passwordHash: await bcrypt_1.default.hash(contrasena, 10),
            rol: 'admin',
        });
    }
    verificarToken(token) {
        try {
            const carga = jsonwebtoken_1.default.verify(token, this.secretoJwt);
            if (typeof carga === 'string' || typeof carga.sub !== 'string' || (carga.rol !== 'admin' && carga.rol !== 'paciente'))
                throw new errors_1.ErrorNoAutorizado();
            return { id: carga.sub, rol: carga.rol };
        }
        catch {
            throw new errors_1.ErrorNoAutorizado('Token inválido o vencido');
        }
    }
    usuarioPublico(usuario) {
        return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
    }
}
exports.AuthService = AuthService;
