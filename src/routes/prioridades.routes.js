const express = require("express");
const router = express.Router();
const prioridadesModel = require("../models/prioridades.model");


router.get("/estatisticas", async (req, res) => {
    try {
        const estatisticas = await prioridadesModel.contarTarefasPorPrioridade();
        res.json(estatisticas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar estatísticas de prioridades" });
    }
});

// GET /prioridades
router.get("/", async (req, res) => {
    try {
        const prioridades = await prioridadesModel.listar();
        res.json(prioridades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar prioridades" });
    }
});

// GET /prioridades/estatisticas

module.exports = router;