const { json, parametroId } = require('./comum');

const paths = {
  '/projetos': {
    get: {
      tags: ['Projetos'],
      summary: 'Lista todos os projetos',
      responses: {
        '200': {
          description: 'Lista de projetos',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Projeto' },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Projetos'],
      summary: 'Cria um novo projeto',
      requestBody: {
        required: true,
        content: json('ProjetoEntrada'),
      },
      responses: {
        '201': { description: 'Projeto criado com sucesso', content: json('Projeto') },
        '400': { description: 'Dados inválidos', content: json('Erro') },
      },
    },
  },
};

const schemas = {
  Projeto: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nome: { type: 'string', example: 'Sistema de Vendas' },
    },
  },
  ProjetoEntrada: {
    type: 'object',
    required: ['nome'],
    properties: {
      nome: { type: 'string', example: 'Sistema de Vendas' },
    },
  },
};

module.exports = { paths, schemas };