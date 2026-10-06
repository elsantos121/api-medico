import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import request from 'supertest';
import app from '../../src/app';

type CuerpoApi = Record<string, unknown>;

export class TurnosWorld extends World {
  readonly api: ReturnType<typeof request>;
  respuesta: { status: number; body: unknown; text: string } | undefined;
  token = '';
  emailPaciente = '';
  contrasenaPaciente = '';
  medicoId = 'medico-prueba';
  turnoId = 'turno-prueba';

  constructor(opciones: IWorldOptions) {
    super(opciones);
    this.api = request(app);
  }

  async get(ruta: string): Promise<void> {
    let solicitud = this.api.get(ruta);
    if (this.token) solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
    this.respuesta = await solicitud;
  }

  async post(ruta: string, datos: CuerpoApi): Promise<void> {
    let solicitud = this.api.post(ruta).send(datos);
    if (this.token) solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
    this.respuesta = await solicitud;
    this.guardarIdentificadores();
  }

  async put(ruta: string, datos: CuerpoApi): Promise<void> {
    let solicitud = this.api.put(ruta).send(datos);
    if (this.token) solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
    this.respuesta = await solicitud;
    this.guardarIdentificadores();
  }

  async borrar(ruta: string): Promise<void> {
    let solicitud = this.api.delete(ruta);
    if (this.token) solicitud = solicitud.set('Authorization', `Bearer ${this.token}`);
    this.respuesta = await solicitud;
  }

  cuerpo(): CuerpoApi {
    if (!this.respuesta || typeof this.respuesta.body !== 'object' || this.respuesta.body === null) {
      return {};
    }
    return this.respuesta.body as CuerpoApi;
  }

  private guardarIdentificadores(): void {
    const cuerpo = this.cuerpo();
    if (typeof cuerpo.id === 'string') {
      if ('pacienteId' in cuerpo || 'estado' in cuerpo) this.turnoId = cuerpo.id;
      else if ('especialidad' in cuerpo) this.medicoId = cuerpo.id;
    }
  }
}

setWorldConstructor(TurnosWorld);