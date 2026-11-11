function formatarTarefa(tarefa) {
    if (!tarefa) return null;

    return {
        id: tarefa.id,
        texto: tarefa.texto,
        coluna: tarefa.coluna || "afazer",
        ordem: tarefa.ordem ?? 0,

        usuarioId: tarefa.usuario_id ?? tarefa.usuarioId,
        projetoId: tarefa.projeto_id ?? tarefa.projetoId ?? null,
        prioridadeId: tarefa.prioridade_id ?? tarefa.prioridadeId ?? 1,

        usuario: tarefa.usuarios?.nome || tarefa.usuario || null,
        projeto: tarefa.projetos?.nome || tarefa.projeto || null,
        prioridade: tarefa.prioridades?.descrição || tarefa.prioridade || "Média",
        prioridade_cor: tarefa.prioridades?.cor || tarefa.prioridade_cor || "#ccc",

        criadoEm: tarefa.criado_em || tarefa.data_criacao || null,
        iniciadaEm: tarefa.iniciada_em || tarefa.data_inicio || null,
        concluidaEm: tarefa.concluida_em || tarefa.data_conclusao || null,
    };
}

module.exports = formatarTarefa;