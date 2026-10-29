const { json, parametroId } = require('./comum');

const paths = {
  '/usuarios': {
    get: {
      tags: ['Usuários'],
      summary: 'Lista todos os usuários',
      responses: {
        '200': {
          description: 'Lista de usuários',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Usuario' },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Usuários'],
      summary: 'Cadastra um novo usuário',
      security: [], // Caso o cadastro seja público
      requestBody: {
        required: true,
        content: json('UsuarioEntrada'),
      },
      responses: {
        '201': { description: 'Usuário criado com sucesso', content: json('Usuario') },
        '400': { description: 'Dados inválidos', content: json('Erro') },
      },
    },
  },
};

const schemas = {
  Usuario: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nome: { type: 'string', example: 'Juca Silva' },
      email: { type: 'string', example: 'juca@exemplo.com' },
    },
  },
  UsuarioEntrada: {
    type: 'object',
    required: ['nome', 'email', 'senha'],
    properties: {
      nome: { type: 'string', example: 'Juca Silva' },
      email: { type: 'string', example: 'juca@exemplo.com' },
      senha: { type: 'string', example: '12345' },
    },
  },
};

module.exports = { paths, schemas };