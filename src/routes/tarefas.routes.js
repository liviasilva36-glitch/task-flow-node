const express = require('express');

const tarefasController = require('../controllers/tarefas.controller');
const autenticar = require('../middlewares/autenticar');
const schemas = require('../middlewares/schemas');
const validar = require('../middlewares/validar');

const router = express.Router();

const idValido = validar(schemas.id, "params");

// Comentado para os testes no Postman
// router.use(autenticar);

// Rotas de consulta / relatórios
router.get('/', tarefasController.listar);
router.get('/estatisticas', tarefasController.estatisticas);
router.get('/resumo', tarefasController.resumo);

// Rotas principais
router.get('/:id', idValido, tarefasController.buscarPorId);
router.post('/', validar(schemas.tarefa), tarefasController.criar); // Middleware adicionado aqui
router.put('/:id', idValido, validar(schemas.tarefa), tarefasController.atualizar);
router.delete('/:id', idValido, tarefasController.remover);

module.exports = router;