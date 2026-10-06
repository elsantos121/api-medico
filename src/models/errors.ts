export class ErrorDominio extends Error {
  constructor(
    mensaje: string,
    readonly estadoHttp: number,
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class ErrorValidacion extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 400);
  }
}

export class ErrorNoAutorizado extends ErrorDominio {
  constructor(mensaje = 'Autenticación requerida') {
    super(mensaje, 401);
  }
}

export class ErrorProhibido extends ErrorDominio {
  constructor(mensaje = 'No tenés permiso para esta operación') {
    super(mensaje, 403);
  }
}

export class ErrorNoEncontrado extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 404);
  }
}

export class ErrorConflicto extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 409);
  }
}