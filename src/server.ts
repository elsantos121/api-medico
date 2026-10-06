import app, { prepararAplicacion } from './app';

const puerto = Number(process.env.PORT ?? 3000);

void prepararAplicacion().then(() => {
  app.listen(puerto, () => {
    console.log(`API de turnos disponible en http://localhost:${puerto}`);
  });
}).catch((error: unknown) => {
  console.error('No se pudo iniciar la API', error);
  process.exitCode = 1;
});