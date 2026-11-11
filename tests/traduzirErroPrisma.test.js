const traduzirErroPrisma = require("../src/ultils/traduzirErroPrisma"); 

describe("Testes de traduzirErroPrisma", () => {
    
    test("traduz erro P2002 (registro duplicado) para status 409 incluindo o campo", () => {
        const erroPrisma = {
            code: "P2002",
            meta: { target: ["email"] }
        };

        const resultado = traduzirErroPrisma(erroPrisma, "POST");

        expect(resultado).toBeInstanceOf(Error);
        expect(resultado.statusCode).toBe(409);
        expect(resultado.message).toContain("Já existe um registro");
    });

    test("traduz erro P2003 no método DELETE para status 409", () => {
        const erroPrisma = { code: "P2003" };

        const resultado = traduzirErroPrisma(erroPrisma, "DELETE");

        expect(resultado).toBeInstanceOf(Error);
        expect(resultado.statusCode).toBe(409);
        expect(resultado.message).toContain("excluir: existem registros ligados");
    });

    test("traduz erro P2003 em outros métodos para status 400", () => {
        const erroPrisma = { code: "P2003" };

        const resultado = traduzirErroPrisma(erroPrisma, "POST");

        expect(resultado).toBeInstanceOf(Error);
        expect(resultado.statusCode).toBe(400);
        expect(resultado.message).toContain("ids informados não existe");
    });

    test("traduz erro P2025 (registro não encontrado) para status 404", () => {
        const erroPrisma = { code: "P2025" };

        const resultado = traduzirErroPrisma(erroPrisma, "GET");

        expect(resultado).toBeInstanceOf(Error);
        expect(resultado.statusCode).toBe(404);
        expect(resultado.message).toBe("Registro não encontrado");
    });

    test("retorna o erro original caso não seja um código tratado do Prisma", () => {
        const erroDesconhecido = new Error("Erro genérico");
        erroDesconhecido.code = "P9999";

        const resultado = traduzirErroPrisma(erroDesconhecido, "GET");

        expect(resultado).toBe(erroDesconhecido);
    });

});