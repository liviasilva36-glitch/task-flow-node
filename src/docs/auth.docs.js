const { json } = require('./comum');

const paths = {
  '/auth/login': {
    post: {
      tags: ['Autenticação'],
      summary: 'Login do usuário',
      security: [],
      requestBody: { required: true, content: json('LoginEntrada') },
      responses: {
        '200': { description: 'Sucesso' },
        '401': { description: 'Credenciais inválidas', content: json('Erro') },
      },
    },
  },
};

const schemas = {
  LoginEntrada: {
    type: 'object',
    required: ['email', 'senha'],
    properties: {
      email: { type: 'string', example: 'juca@exemplo.com' },
      senha: { type: 'string', example: '12345' },
    },
  },
};

module.exports = { paths, schemas };