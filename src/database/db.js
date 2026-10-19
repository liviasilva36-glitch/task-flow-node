require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Executa os ajustes na tabela e insere o projeto padrao vinculado ao usuario 1
(async () => {
  try {
    await pool.query("ALTER TABLE tarefas ALTER COLUMN projeto_id DROP NOT NULL;");
    await pool.query(
      "INSERT INTO projetos (id, nome, usuario_id) VALUES (1, 'Projeto Padrao', 1) ON CONFLICT (id) DO NOTHING;"
    );
    console.log("-> Banco de dados ajustado com sucesso!");
  } catch (err) {
    console.error("-> Aviso no ajuste do banco:", err.message);
  }
})();

module.exports = pool;