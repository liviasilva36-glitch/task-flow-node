const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); // O app.js já carregou o .env

// Um token válido, com o mesmo segredo que o autenticar confere
const token = jwt.sign({ id: 1, nome: 'Teste' }, process.env.JWT_SECRET);

// Silencia os logs no terminal durante os testes
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('rotas da API', () => {
  // ==========================================
  // 6 TESTES DO BLOCO 4 (Slides 28 a 32)
  // ==========================================

  // Protege: a montagem básica da API e a rota raiz GET /
  test('GET / responde 200 com a mensagem da API', async () => {
    const resposta = await request(app).get('/');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      api: 'TaskFlow',
      versao: '1.0',
      status: 'online',
    });
  });

  // Protege: a rota 404 genérica no final do app.js e o tratarErros
  test('rota que não existe responde 404', async () => {
    const resposta = await request(app).get('/nao-existe');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toContain('não encontrada');
  });

  // Protege: o middleware autenticar na rota /tarefas
  test('GET /tarefas sem token responde 401', async () => {
    const resposta = await request(app).get('/tarefas');

    expect(resposta.status).toBe(401);
  });

  // Protege: o jwt.verify dentro do middleware autenticar
  test('GET /tarefas com token falso responde 401', async () => {
    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', 'Bearer abc.def.ghi');

    expect(resposta.status).toBe(401);
  });

  // Protege: a ligação do middleware validar na rota POST /tarefas
  test('POST /tarefas inválido responde 400', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({ texto: '' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe('Dados inválidos');
  });

  // Protege: o middleware validarContentType na entrada da API
  test('POST /tarefas sem JSON responde 415', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('texto solto');

    expect(resposta.status).toBe(415);
  });

  // ==========================================
  // 5 TESTES DO EXERCÍCIO (Slide 34)
  // ==========================================

  // 1. Protege: o middleware autenticar na rota /prioridades
  test('GET /prioridades sem token responde 401', async () => {
    const resposta = await request(app).get('/prioridades');

    expect(resposta.status).toBe(401);
  });

  // 2. Protege: a conferência do JWT_SECRET no jwt.verify do autenticar
  test('GET /tarefas com token assinado com segredo errado responde 401', async () => {
    const tokenSegredoErrado = jwt.sign({ id: 1 }, 'outro-segredo');

    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', `Bearer ${tokenSegredoErrado}`);

    expect(resposta.status).toBe(401);
  });

  // 3. Protege: a validação de todos os campos obrigatórios no middleware validar
  test('POST /tarefas com body vazio retorna 400 e os detalhes de campo obrigatório', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.detalhes).toEqual([
      "O campo 'texto' é obrigatório",
      "O campo 'usuarioId' é obrigatório",
    ]);
  });

  // 4. Protege: a validação de tipo inteiro positivo no middleware validar
  test('POST /tarefas com usuarioId inválido retorna 400 e o detalhe de tipo', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        texto: 'Estudar Supertest',
        usuarioId: 'abc',
      });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.detalhes).toEqual([
      "O campo 'usuarioId' deve ser inteiro positivo",
    ]);
  });

  // 5. Protege: a rota 404 genérica no final do app.js mesmo quando há token válido
  test('GET /rota/que/nao/existe com token responde 404', async () => {
    const resposta = await request(app)
      .get('/rota/que/nao/existe')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(404);
  });
});