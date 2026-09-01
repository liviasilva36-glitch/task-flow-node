const express = require('express');
const router = express.Router();

let tarefas = []; // Array inicia vazio para atender ao teste inicial do slide
let proximoId = 1;

// GET /tarefas — listar todas (com suporte a filtro por ?coluna=)
router.get('/', (req, res) => {
    const { coluna } = req.query;
    let resultado = tarefas;
    if (coluna) {
        resultado = tarefas.filter(t => t.coluna === coluna);
    }
    res.json(resultado);
});

// GET /tarefas/:id — buscar tarefa por ID
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json(tarefa);
});

// POST /tarefas — criar nova tarefa (retorna status 201)
router.post('/', (req, res) => {
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
});

// PUT /tarefas/:id — editar tarefa (retorna status 200)
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = tarefas.findIndex(t => t.id === id);

    if (idx === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    tarefas[idx] = { ...tarefas[idx], ...req.body, id };
    res.json(tarefas[idx]);
});

// DELETE /tarefas/:id — remover tarefa (retorna status 200)
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = tarefas.findIndex(t => t.id === id);

    if (idx === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    const removida = tarefas.splice(idx, 1)[0];
    res.json({ mensagem: 'Tarefa removida', tarefa: removida });
});

module.exports = router;