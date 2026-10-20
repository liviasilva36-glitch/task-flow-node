const db = require("../database/db");

const prioridade = {
    listar: async () => {
        const resultado = await db.query(
            "SELECT id, nome FROM prioridades ORDER BY id"
        );
        return resultado.rows;
    },
};

module.exports = prioridade;