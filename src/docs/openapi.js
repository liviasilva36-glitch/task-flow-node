const { schemas: schemasComum } = require('./comum');
const tarefasDocs = require('./tarefas.docs');
const authDocs = require('./auth.docs');
const prioridadesDocs = require('./prioridades');
const usuariosDocs = require('./usuarios.docs');
const projetosDocs = require('./projetos.docs');

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'Documentació OpenAPI de la API TaskFlow',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor Actual (Relatiu)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ...schemasComum,
      ...tarefasDocs.schemas,
      ...authDocs.schemas,
      ...prioridadesDocs.schemas,
      ...usuariosDocs.schemas,
      ...projetosDocs.schemas,
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    ...authDocs.paths,
    ...tarefasDocs.paths,
    ...prioridadesDocs.paths,
    ...usuariosDocs.paths,
    ...projetosDocs.paths,
  },
};