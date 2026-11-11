const formatarTarefa = require("../src/ultils/formatarTarefa");

function tarefaDoPrisma() {
    return { 
        id: 1, 
        texto: "definir tabela no banco", 
        coluna: "afazer",
        projetos: { nome: "Projeto Teste" }, 
        usuarios: { nome: "Usuario Teste" },
        prioridades: { descrição: "Alta", cor: "#ff0000" },
        usuario_id: 1, 
        projeto_id: 1, 
        prioridade_id: 1, 
        criado_em: "2024-06-10T00:00:00.000Z",
        iniciada_em: null, 
        concluida_em: null 
    };
} 

test("achata as relações no formato que o front espera", () => {
    const resultado = formatarTarefa(tarefaDoPrisma());
    expect(resultado).toEqual({
        id: 1,
        texto: "definir tabela no banco",
        coluna: "afazer",
        ordem: 0,
        usuarioId: 1,
        projetoId: 1,
        prioridadeId: 1,
        usuario: "Usuario Teste",
        projeto: "Projeto Teste",
        prioridade: "Alta",
        prioridade_cor: "#ff0000",
        criadoEm: "2024-06-10T00:00:00.000Z",
        iniciadaEm: null,
        concluidaEm: null
    });
});

test("define fallback na prioridade quando a relação não existe", () => {
    const tarefa = tarefaDoPrisma();
    delete tarefa.prioridades;
    const resultado = formatarTarefa(tarefa);
    // Como a sua função define um fallback para "Média" caso não venha a prioridade:
    expect(resultado.prioridade).toBe("Média");
});
    
test("não altera o objeto original passado como parâmetro (imutabilidade)", () => {
    const tarefa = tarefaDoPrisma();
    const resultado = formatarTarefa(tarefa);
    
    expect(resultado).not.toBe(tarefa);
    // Usando toHaveProperty correto do Jest
    expect(tarefa).toHaveProperty("projetos", { nome: "Projeto Teste" });
});

test("retorna null ou lida com entrada nula com segurança", () => {
    const resultado = formatarTarefa(null);
    expect(resultado).toBeNull();
});