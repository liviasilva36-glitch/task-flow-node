const criarErro = require('../src/ultils/criarErro'); 
describe('Testes da função criar erro', () => {
    test('devolve um erro com o status e a mensagem', () => {
        const erro = criarErro(404, 'Tarefa não encontrada');

        expect(erro).toBeInstanceOf(Error);
        expect(erro.statusCode).toBe(404);
        expect(erro.message).toBe('Tarefa não encontrada');
    });
});