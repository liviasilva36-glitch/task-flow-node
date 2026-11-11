const formatarTarefa= require ("../src/ultils/formatarTarefa");



function tarefaDoPrisma  () {
    return { id:1 , tetxo : "definir tabela no banco ", coluna: " afzer",
                 projetos: { nome: "Projeto Teste" }, usuarios: { nome: "Usuario Teste" },
                 prioridades: { descrição: "Alta", cor: "#ff0000" },
                 usuario_id: 1, projeto_id: 1, prioridade_id: 1, criado_em: "2024-06-10T00:00:00.000Z",
                 iniciada_em: null, finalizada_em: null };
}   


test ("achata as relações no formato que o fornt espera", () => {
    const resultado = formatarTarefa(tarefaDoPrisma ());
    expect(resultado).toEqual({
        id: 1,
        texto: "definir tabela no banco ",
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