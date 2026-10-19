const express = require("express");
const schemas = require("../middlewares/schemas");
const validar = require("../middlewares/validar"); // Importação que faltava
const usuariosController = require("../controllers/usuarios.controller");

const router = express.Router();
const idValido = validar(schemas.id, "params");

// Rotas da API para utilizadores
router.get("/", usuariosController.listar);
router.post("/", validar(schemas.usuario), usuariosController.criar);
router.get("/:id", idValido, usuariosController.buscarPorId);
router.put("/:id", idValido, validar(schemas.usuario), usuariosController.atualizar);
router.delete("/:id", idValido, usuariosController.excluir || usuariosController.remover);

module.exports = router;