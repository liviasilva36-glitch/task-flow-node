let tarefas = [
    { id: 1, texto: 'Estudar Node.js',
         prioridade: 'alta',
          coluna: 'andamento' },
{ id: 2, texto: 'Fazer exercícios',
     prioridade: 'media',
         coluna: 'afazer' },
];
let proximoId = 1;

  module.exports = {
  listar: () => tarefas,

  listaPorColuna: (coluna) => tarefas.filter(t => t.coluna === coluna),

  buscarPorId(req, res) {
    const id = parseInt(req.params.id);
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json(tarefa);
  },

  
  criar(req, res) {
    const { texto, prioridade, coluna } = req.body;
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
    const id = parseInt(req.params.id);
    const idx = tarefas.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    const removida = tarefas.splice(idx, 1)[0];
    res.json({ mensagem: 'Tarefa removida', tarefa: removida });
  }
};



