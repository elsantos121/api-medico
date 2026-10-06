"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorConflicto = exports.ErrorNoEncontrado = exports.ErrorProhibido = exports.ErrorNoAutorizado = exports.ErrorValidacion = exports.ErrorDominio = void 0;
class ErrorDominio extends Error {
    estadoHttp;
    constructor(mensaje, estadoHttp) {
        super(mensaje);
        this.estadoHttp = estadoHttp;
        this.name = new.target.name;
    }
}
exports.ErrorDominio = ErrorDominio;
class ErrorValidacion extends ErrorDominio {
    constructor(mensaje) {
        super(mensaje, 400);
    }
}
exports.ErrorValidacion = ErrorValidacion;
class ErrorNoAutorizado extends ErrorDominio {
    constructor(mensaje = 'Autenticación requerida') {
        super(mensaje, 401);
    }
}
exports.ErrorNoAutorizado = ErrorNoAutorizado;
class ErrorProhibido extends ErrorDominio {
    constructor(mensaje = 'No tenés permiso para esta operación') {
        super(mensaje, 403);
    }
}
exports.ErrorProhibido = ErrorProhibido;
class ErrorNoEncontrado extends ErrorDominio {
    constructor(mensaje) {
        super(mensaje, 404);
    }
}
exports.ErrorNoEncontrado = ErrorNoEncontrado;
class ErrorConflicto extends ErrorDominio {
    constructor(mensaje) {
        super(mensaje, 409);
    }
}
exports.ErrorConflicto = ErrorConflicto;
