const paths = {
  '/prioridades': {
    get: {
      tags: ['Prioridades'],
      summary: 'Lista todas as prioridades',
      responses: {
        '200': {
          description: 'Lista de prioridades',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Prioridade' },
              },
            },
          },
        },
      },
    },
  },
};

const schemas = {
  Prioridade: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nome: { type: 'string', example: 'Alta' },
    },
  },
};

module.exports = { paths, schemas };