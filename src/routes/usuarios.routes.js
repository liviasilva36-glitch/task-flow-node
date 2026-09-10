const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuarios.controller');
const  schemas = require('../middlewares/schemas');
const validar = require('../middlewares/validar');

router.get('/', usuariosController.listar);
router.post('/', usuariosController.criar);
router.get('/:id', usuariosController.buscarPorId);
router.put('/:id', usuariosController.atualizar);
router.delete('/:id', usuariosController.remover);
router.post('/', validar(schemas.usuario), usuariosController.criar);
router.put('/:id', validar(schemas.usuario), usuariosController.atualizar);

module.exports = router;