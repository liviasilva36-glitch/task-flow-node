const db = require("../database/db");

const prioridade = {
    listar: async () => {
        const resultado = await db.query(
            "SELECT id, nome FROM prioridades ORDER BY id"
        );
        return resultado.rows;
    },
    contarTarefasPorPrioridade: async () => {
        const query = `
            SELECT 
            p.id, 
            p.nome, 
            COUNT(t.id) as quantidade_tarefas
            FROM prioridades p
            LEFT JOIN tarefas t ON p.id = t.prioridade_id
            GROUP BY p.id, p.nome
        `;
        const resultado = await db.query(query);
        return resultado.rows;
    }
};

module.exports = prioridade;