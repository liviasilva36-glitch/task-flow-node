const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');

// Rotas específicas
router.get('/', tarefasController.listar);
router.get('/estatisticas', tarefasController.estatisticas);
router.get('/resumo', tarefasController.resumo);

// Rotas genéricas / com ID
router.get('/:id', tarefasController.buscarPorId);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);

module.exports = router;