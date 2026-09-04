const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefas.controller');


router.get('/', tarefasController.listar);
router.get('/estatisticas', tarefasController.estatisticas);
router.get('/resumo', tarefasController.resumo);
router.get('/:id', tarefasController.buscarPorId);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);

module.exports = router;

