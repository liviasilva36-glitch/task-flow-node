const criarErro = require('../src/ultils/criarErro');
const traduzirErroPrisma = require('../src/ultils/traduzirErroPrisma');

describe('Testes do exercício em duplas', () => {
  test('criarErro(500, "Erro interno no servidor") retorna status 500 e detalhes undefined', () => {
    const erro = criarErro(500, 'Erro interno no servidor');

    expect(erro.statusCode).toBe(500);
    expect(erro.detalhes).toBeUndefined();
  });

        
  test('P2003 ao atualizar (PUT) vira 400 com mensagem específica', () => {
    const erroPrisma = { code: 'P2003' };

    const resultado = traduzirErroPrisma(erroPrisma, 'PUT');

    expect(resultado.statusCode).toBe(400);
    expect(resultado.message).toBe('Um dos ids informados não existe');
  });

  test('P2025 tem a mensagem "Registro não encontrado"', () => {
    const erroPrisma = { code: 'P2025' };

    const resultado = traduzirErroPrisma(erroPrisma);

    expect(resultado.message).toBe('Registro não encontrado');
  });

  test('P2003 ao excluir (DELETE) tem mensagem específica', () => {
    const erroPrisma = { code: 'P2003' };

    const resultado = traduzirErroPrisma(erroPrisma, 'DELETE');

    expect(resultado.message).toBe('Não é possível excluir: existem registros ligados a este');
  });
});