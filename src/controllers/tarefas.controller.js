let tarefas = [
  { id: 1, texto: 'Estudar Node.js',
     prioridade: 'alta', coluna: 'andamento' },
  { id: 2, texto: 'Fazer exercícios',
   prioridade: 'media', coluna: 'afazer' },
];
let proximoId = 1;



const tarefasController = {
  listar(req, res) {
    const { coluna } = req.query;
    const resultado = coluna
    ? tarefasModel.listarPorColuna(coluna)
    : tarefasModel.listar();
    res.json(resultado);
  },

  estatisticas(req, res) {
    const { coluna } = req.query;
    const base = coluna ? tarefasModel.listarPorColuna(coluna) : tarefasModel.listar();
    const porColuna = {
      afazer: base.filter(t => t.coluna === 'afazer').length,
      andamento: base.filter(t => t.coluna === 'andamento').length,
      concluido: base.filter(t => t.coluna === 'concluido').length,
    };
    res.json({ total: base.length, porColuna });
  },

  resumo(req, res) {
    const X = tarefas.length;
    const Y = tarefas.filter(t => t.coluna === 'concluido').length;
    const Z = tarefas.filter(t => t.coluna === 'andamento').length;
    const W = tarefas.filter(t => t.coluna === 'afazer').length;

    res.json({
      mensagem: `Você tem ${X} tarefas. ${Y} concluídas, ${Z} em andamento e ${W} a fazer.`
    });
  },

  buscarPorId(req, res) {
    const tarefa = tarefasModel.buscar(parseInt(req.params.id));
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json(tarefa);
  },

  criar(req, res) {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ erro: 'Texto obrigatório' });
    const nova = {
      id: proximoId++,
      texto,
      prioridade: prioridade || 'media',
      coluna: coluna || 'afazer'
    };
    tarefas.push(nova);
    res.status(201).json(nova);
  },

  atualizar(req, res) {
    const id = parseInt(req.params.id);
    const idx = tarefas.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    tarefas[idx] = { ...tarefas[idx], ...req.body, id };
    res.json(tarefas[idx]);
  },

  remover(req, res) {
    const removida = tarefasModel.remover(parseInt(req.params.id));
    if(!removida) return res.status(404).json({ erro: 'Tarefa não encontrada'})
    res.json({ mensagem: 'Tarefa removida', tarefa: removida});
  },
}

module.exports = tarefasController;