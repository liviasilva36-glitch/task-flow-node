const pool = require("../database/db");

// Formata a linha do PostgreSQL para o padrão JSON esperado pelo Frontend
function formatarTarefa(row) {
  if (!row) return null;
  return {
    id: row.id,
    texto: row.texto || row.titulo || row.descricao,
    coluna: row.status || "afazer",
    usuarioId: row.usuario_id,
    projetoId: row.projeto_id,
    dataConclusao: row.data_conclusao,
  };
}

async function listar() {
  const result = await pool.query("SELECT * FROM tarefas ORDER BY id ASC");
  return result.rows.map(formatarTarefa);
}

async function buscar(id) {
  const result = await pool.query("SELECT * FROM tarefas WHERE id = $1", [id]);
  return formatarTarefa(result.rows[0]);
}

async function listarPorColuna(coluna) {
  const result = await pool.query("SELECT * FROM tarefas WHERE status = $1", [coluna]);
  return result.rows.map(formatarTarefa);
}

async function listarPorUsuario(usuarioId) {
  const result = await pool.query("SELECT * FROM tarefas WHERE usuario_id = $1", [usuarioId]);
  return result.rows.map(formatarTarefa);
}

async function listarPorProjeto(projetoId) {
  const result = await pool.query("SELECT * FROM tarefas WHERE projeto_id = $1", [projetoId]);
  return result.rows.map(formatarTarefa);
}

async function adicionar(dados) {
  const { texto, coluna, usuarioId, projetoId, dataConclusao } = dados;

  // Envia diretamente o valor enviado (ex: "afazer") ou "afazer" como padrão
  const statusDb = coluna || "afazer";

  const query = `
    INSERT INTO tarefas (texto, status, usuario_id, projeto_id, data_conclusao)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    texto,
    statusDb,
    usuarioId,
    projetoId,
    dataConclusao || null,
  ];

  const result = await pool.query(query, values);
  return formatarTarefa(result.rows[0]);
}

async function atualizar(id, dados) {
  const tarefaAtual = await buscar(id);
  if (!tarefaAtual) {
    return null;
  }

  const texto = dados.texto !== undefined ? dados.texto : tarefaAtual.texto;
  const coluna = dados.coluna !== undefined ? dados.coluna : tarefaAtual.coluna;
  const usuarioId = dados.usuarioId !== undefined ? dados.usuarioId : tarefaAtual.usuarioId;
  const projetoId = dados.projetoId !== undefined ? dados.projetoId : tarefaAtual.projetoId;
  const dataConclusao = dados.dataConclusao !== undefined ? dados.dataConclusao : tarefaAtual.dataConclusao;

  const statusDb = coluna || "afazer";

  const query = `
    UPDATE tarefas
    SET texto = $1,
        status = $2,
        usuario_id = $3,
        projeto_id = $4,
        data_conclusao = $5
    WHERE id = $6
    RETURNING *
  `;

  const values = [
    texto,
    statusDb,
    usuarioId,
    projetoId,
    dataConclusao,
    id,
  ];

  const result = await pool.query(query, values);
  return formatarTarefa(result.rows[0]);
}

async function remover(id) {
  const query = `
    DELETE FROM tarefas 
    WHERE id = $1 
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  return formatarTarefa(result.rows[0]);
}

module.exports = {
  listar,
  buscar,
  listarPorColuna,
  listarPorUsuario,
  listarPorProjeto,
  adicionar,
  atualizar,
  remover,
};