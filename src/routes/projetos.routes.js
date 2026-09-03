const express = require("express");
const router = express.Router();
const projetosController = require ("../controllers/projetos.controller")

router.get("/", projetosController.listarProjetos);

router.get("/:id", projetosController.buscarProjetosId);

router.post("/", projetosController.criarProjetos);

router.put("/:id", projetosController.atualizarProjetos);

router.delete("/:id", projetosController.removerProjetos);

module.exports = router;