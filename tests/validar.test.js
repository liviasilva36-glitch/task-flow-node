
const validar = require("../src/middlewares/validar");

const schemas = {
    tarefa: {
        texto: { obrigatorio: true, tipo: "string" },
        coluna: { obrigatorio: true, tipo: "string", valores: ["a_fazer", "andamento", "concluido"] },
        usuario_id: { obrigatorio: true, tipo: "inteiro" },
        projeto_id: { obrigatorio: true, tipo: "inteiro" },
        idprioridade: { obrigatorio: true, tipo: "inteiro" },
    },
};

function pegarErro(funcao) {
    try {
        funcao();
    } catch (error) {
        return error;
    }
}

function tarefaValida() {
    return {
        texto: "Estudar testes automatizados",
        coluna: "a_fazer",
        usuario_id: 1,
        projeto_id: 1,
        idprioridade: 1,
    };
}

describe("Testes do middleware validar", () => {
    // Teste 1: Cenário válido
    test("chama o next quando não ha erros", () => {
        const middleware = validar(schemas.tarefa);
        const req = { body: tarefaValida() };
        const next = jest.fn();

        middleware(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    // Teste 2: Body vazio (todos os campos faltando)
    test("body vazio: retorna 400 e lista todos os campos obrigatórios", () => {
        const middleware = validar(schemas.tarefa);
        const req = { body: {} };
        const next = jest.fn();

        const erro = pegarErro(() => middleware(req, {}, next));

        expect(erro.status).toBe(400);
        expect(erro.message).toBe("Dados inválidos");
        expect(erro.detalhes).toEqual([
            "O campo 'texto' é obrigatório",
            "O campo 'coluna' é obrigatório",
            "O campo 'usuario_id' é obrigatório",
            "O campo 'projeto_id' é obrigatório",
            "O campo 'idprioridade' é obrigatório",
        ]);
        expect(next).not.toHaveBeenCalled();
    });

    // Teste 3: Coluna inválida
    test("coluna fora da lista: diz os valores aceitos", () => {
        const middleware = validar(schemas.tarefa);
        const req = { body: { ...tarefaValida(), coluna: "feito" } };
        const next = jest.fn();

        const erro = pegarErro(() => middleware(req, {}, next));

        expect(erro.detalhes).toEqual([
            "O campo 'coluna' deve ser um de: a_fazer, andamento, concluido",
        ]);
        expect(next).not.toHaveBeenCalled();
    });
});
