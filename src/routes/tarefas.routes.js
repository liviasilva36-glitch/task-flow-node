const express = require('express');
const router = express.Router();

const tarefasController = require('../controllers/tarefas.controller');
const autenticar = require('../middlewares/autenticar');
const schemas = require('../middlewares/schemas');
const validar = require('../middlewares/validar');


router.use(autenticar);


router.get('/',    tarefasController.listar);
router.get('/estatisticas', tarefasController.estatisticas);
router.get('/resumo', tarefasController.resumo);
router.get('/:id', tarefasController.buscarPorId);


router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.remover);


module.exports = router;

