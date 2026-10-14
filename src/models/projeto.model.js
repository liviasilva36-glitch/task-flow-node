const pool = require("../database/db");

async function listar() {
  const result = await pool.query("SELECT * FROM projetos ORDER BY id ASC");
  return result.rows;
}

async function buscarPorId(id) {
  const result = await pool.query("SELECT * FROM projetos WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function criar(dados) {
  const { nome, descricao } = dados;
  const query = `
    INSERT INTO projetos (nome, descricao)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await pool.query(query, [nome, descricao]);
  return result.rows[0];
}

async function atualizar(id, dados) {
  const projetoAtual = await buscarPorId(id);
  if (!projetoAtual) return null;

  const nome = dados.nome !== undefined ? dados.nome : projetoAtual.nome;
  const descricao = dados.descricao !== undefined ? dados.descricao : projetoAtual.descricao;

  const query = `
    UPDATE projetos
    SET nome = $1, descricao = $2
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [nome, descricao, id]);
  return result.rows[0];
}

async function remover(id) {
  const query = "DELETE FROM projetos WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};