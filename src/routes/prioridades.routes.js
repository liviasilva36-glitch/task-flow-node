const express = require("express");
const router = express.Router();
const prioridadesController = require("../controllers/prioridades.controller");

// Define que requisições GET para /prioridades chamam a função listar
router.get("/", prioridadesController.listar);

router.get("/contagem", prioridadesController.contarTarefas);

module.exports = router;