function formatarTarefa(Tarefa) {
    const { projetos, usuarios, prioridades, ...texto } = Tarefa;

    return {
        ...texto, // Mantém as outras propriedades da tarefa, se necessário
        projeto: projetos?.nome, 
        usuario: usuarios?.nome,
        prioridade: prioridades?.descrição,
        prioridade_cor: prioridades?.cor,
    };

}

module.exports = formatarTarefa;