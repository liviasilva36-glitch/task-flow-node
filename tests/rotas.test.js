const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const prisma = require('../src/lib/prisma');

let USUARIO_ID;
let PROJETO_ID;
let PRIORIDADE_ID;
let token;

// Busca (ou garante) registros reais no branch test antes de rodar os testes
beforeAll(async () => {
  let usuario = await prisma.usuarios.findFirst();
  if (!usuario) {
    usuario = await prisma.usuarios.create({
      data: {
        nome: 'Usuário Teste',
        email: `teste_${Date.now()}@taskflow.com`,
        senha: '123',
      },
    });
  }

  let projeto = await prisma.projetos.findFirst();
  if (!projeto) {
    projeto = await prisma.projetos.create({
      data: { nome: 'Projeto Teste' },
    });
  }

  let prioridade = await prisma.prioridades.findFirst();
  if (!prioridade) {
    prioridade = await prisma.prioridades.create({
      data: { nome: 'Normal', ordem: 1 },
    });
  }

  USUARIO_ID = usuario.id;
  PROJETO_ID = projeto.id;
  PRIORIDADE_ID = prioridade.id;

  token = jwt.sign({ id: USUARIO_ID, nome: 'Teste' }, process.env.JWT_SECRET);
});

// Fecha a conexão do Prisma após todos os testes deste arquivo
afterAll(async () => {
  await prisma.$disconnect();
});

// Silencia os logs no terminal durante os testes
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('rotas da API', () => {
  // ==========================================
  // 6 TESTES DO BLOCO 4 (Dia 5 - Slides 28 a 32)
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
  // 5 TESTES DO EXERCÍCIO (Dia 5 - Slide 34)
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

  // ==========================================
  // 3 TESTES QUE CHEGAM AO BANCO (Dia 6 - Bloco 4)
  // ==========================================

  // Teste 7: rota protegida com token devolve a lista do branch test
  test('GET /prioridades com token: 200 e uma lista', async () => {
    const resposta = await request(app)
      .get('/prioridades')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  // Teste 8: criar e remover uma tarefa (Regra 2: independência)
  test('POST /tarefas cria (201) e o DELETE remove', async () => {
    const nova = {
      texto: 'Tarefa criada pelo teste',
      coluna: 'afazer',
      usuarioId: USUARIO_ID,
      projetoId: PROJETO_ID,
      prioridadeId: PRIORIDADE_ID,
    };

    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send(nova);

    expect(criada.status).toBe(201);
    expect(criada.body).toHaveProperty('id');

    const removida = await request(app)
      .delete(`/tarefas/${criada.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removida.status).toBe(200);
  });

  // Teste 9: tarefa que não existe responde 404
  test('GET /tarefas/999999 responde 404', async () => {
    const resposta = await request(app)
      .get('/tarefas/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe('Tarefa não encontrada');
  });

  // ==========================================
  // 4 TESTES DO EXERCÍCIO (Dia 6 - Slide 28)
  // ==========================================

  // 1. GET /tarefas com token: 200 e uma lista
  test('GET /tarefas com token: 200 e uma lista', async () => {
    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  // 2. GET /projetos: 200 e uma lista
  test('GET /projetos: 200 e uma lista', async () => {
    const resposta = await request(app)
      .get('/projetos')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  // 3 e 4. Cria tarefa, busca com GET /tarefas/:id, remove e confirma 404 após remoção
  test('POST cria tarefa, GET /:id encontra, DELETE remove e GET /:id seguinte dá 404', async () => {
    const nova = {
      texto: 'Tarefa do exercício Dia 6',
      coluna: 'afazer',
      usuarioId: USUARIO_ID,
      projetoId: PROJETO_ID,
      prioridadeId: PRIORIDADE_ID,
    };

    // Cria a tarefa
    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send(nova);

    expect(criada.status).toBe(201);
    const idCriado = criada.body.id;

    // Item 3: Busca a tarefa criada
    const buscada = await request(app)
      .get(`/tarefas/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);

    expect(buscada.status).toBe(200);
    expect(buscada.body.texto).toBe(nova.texto);

    // Remove no fim (Regra 2)
    const removida = await request(app)
      .delete(`/tarefas/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removida.status).toBe(200);

    // Item 4: Tenta buscar o mesmo ID depois da remoção -> 404
    const aposRemover = await request(app)
      .get(`/tarefas/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);

    expect(aposRemover.status).toBe(404);
  });
});