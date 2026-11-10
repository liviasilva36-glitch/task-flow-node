describe('Primeiro Teste', () => {
  it('deve verificar se o Jest está funcionando', () => {
    expect(1 + 1).toBe(2);
  });
});

const request = require('supertest');
const app = require('./server'); // ou o caminho do seu arquivo express

describe('Testes das Rotas', () => {
  it('deve responder com status 200 na rota principal', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});