"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioTurnosMemoria = exports.RepositorioMedicosMemoria = exports.RepositorioUsuariosMemoria = void 0;
class RepositorioUsuariosMemoria {
    usuarios = new Map();
    buscarPorEmail(email) {
        return [...this.usuarios.values()].find((usuario) => usuario.email === email);
    }
    buscarPorId(id) {
        return this.usuarios.get(id);
    }
    crear(usuario) {
        this.usuarios.set(usuario.id, usuario);
        return usuario;
    }
    listar() {
        return [...this.usuarios.values()];
    }
    limpiar() {
        this.usuarios.clear();
    }
}
exports.RepositorioUsuariosMemoria = RepositorioUsuariosMemoria;
class RepositorioMedicosMemoria {
    medicos = new Map();
    buscarPorId(id) {
        return this.medicos.get(id);
    }
    listar(especialidad) {
        return [...this.medicos.values()].filter((medico) => !especialidad || medico.especialidad.toLowerCase() === especialidad.toLowerCase());
    }
    crear(medico) {
        this.medicos.set(medico.id, medico);
        return medico;
    }
    actualizar(id, cambios) {
        const medico = this.buscarPorId(id);
        if (!medico)
            return undefined;
        const actualizado = { ...medico, ...cambios };
        this.medicos.set(id, actualizado);
        return actualizado;
    }
    limpiar() {
        this.medicos.clear();
    }
}
exports.RepositorioMedicosMemoria = RepositorioMedicosMemoria;
class RepositorioTurnosMemoria {
    turnos = new Map();
    buscarPorId(id) {
        return this.turnos.get(id);
    }
    listar() {
        return [...this.turnos.values()];
    }
    crear(turno) {
        this.turnos.set(turno.id, turno);
        return turno;
    }
    actualizar(id, cambios) {
        const turno = this.buscarPorId(id);
        if (!turno)
            return undefined;
        const actualizado = { ...turno, ...cambios };
        this.turnos.set(id, actualizado);
        return actualizado;
    }
    limpiar() {
        this.turnos.clear();
    }
}
exports.RepositorioTurnosMemoria = RepositorioTurnosMemoria;
