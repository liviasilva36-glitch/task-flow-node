require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    // 1. Ajuste na tabela de tarefas
    await pool.query("ALTER TABLE tarefas ALTER COLUMN projeto_id DROP NOT NULL;");

    // 2. Garante o projeto padrão
    await pool.query(
      "INSERT INTO projetos (id, nome, usuario_id) VALUES (1, 'Projeto Padrao', 1) ON CONFLICT (id) DO NOTHING;"
    );

    // 3. Remove a tabela antiga para recriá-la com a estrutura correta
    await pool.query("DROP TABLE IF EXISTS prioridades CASCADE;");

    // 4. Recria a tabela com as colunas corretas
    await pool.query(`
      CREATE TABLE prioridades (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(20) NOT NULL UNIQUE
      );
    `);

    // 5. Insere os valores padrão
    await pool.query(`
      INSERT INTO prioridades (nome) 
      VALUES ('baixa'), ('média'), ('alta')
      ON CONFLICT (nome) DO NOTHING;
    `);

    // 6. Adiciona/Garante a chave estrangeira na tabela tarefas
    await pool.query(`
      ALTER TABLE tarefas 
      ADD COLUMN IF NOT EXISTS prioridade_id INT DEFAULT 1 REFERENCES prioridades(id);
    `);

    console.log("-> Banco de dados ajustado com sucesso (prioridades integradas)!");
  } catch (err) {
    console.error("-> Aviso no ajuste do banco:", err.message);
  }
})();

module.exports = pool;