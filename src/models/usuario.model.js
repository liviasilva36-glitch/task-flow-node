const pool = require("../database/db");

const usuarioModel = {
  async listar() {
    const result = await pool.query(
      "SELECT id, nome, email FROM usuarios ORDER BY id ASC"
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async buscarPorEmail(email) {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  },

  async autenticar(email, senha) {
    // Corrigido 'senha' para 'senha_hash'
    const result = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha_hash = $2",
      [email, senha]
    );
    return result.rows[0] || null;
  },

  async criar(nome, email, senha) {
    // Corrigido 'senha' para 'senha_hash'
    const query = `
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nome, email
    `;
    const result = await pool.query(query, [nome, email, senha]);
    return result.rows[0];
  },

  async atualizar(id, dados) {
    const usuarioAtual = await this.buscarPorId(id);
    if (!usuarioAtual) {
      return null;
    }

    const nome = dados.nome !== undefined ? dados.nome : usuarioAtual.nome;
    const email = dados.email !== undefined ? dados.email : usuarioAtual.email;
    const senha = dados.senha !== undefined ? dados.senha : null;

    // Corrigido 'senha' para 'senha_hash'
    const query = `
      UPDATE usuarios
      SET nome = $1, email = $2, senha_hash = COALESCE($3, senha_hash)
      WHERE id = $4
      RETURNING id, nome, email
    `;

    const result = await pool.query(query, [nome, email, senha, id]);
    return result.rows[0];
  },

  async remover(id) {
    const query = `
      DELETE FROM usuarios 
      WHERE id = $1 
      RETURNING id, nome, email
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },
};

module.exports = usuarioModel;