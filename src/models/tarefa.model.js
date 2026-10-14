const pool = require("../database/db");

// Mapeamento de português (API) para inglês (Banco Neon)
const paraBanco = {
  afazer: "todo",
  andamento: "doing",
  concluido: "done",
};

// Mapeamento de inglês (Banco Neon) para português (API)
const paraAPI = {
  todo: "afazer",
  doing: "andamento",
  done: "concluido",
};

// Função auxiliar para formatar a resposta para a API
function formatarTarefa(row) {
  if (!row) return null;
  return {
    ...row,
    coluna: paraAPI[row.coluna] || row.coluna,
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
  const colunaDb = paraBanco[coluna] || coluna;
  const result = await pool.query("SELECT * FROM tarefas WHERE coluna = $1", [colunaDb]);
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

  // Converte "afazer" -> "todo", etc.
  const colunaDb = paraBanco[coluna] || "todo";

  const query = `
    INSERT INTO tarefas (texto, coluna, usuario_id, projeto_id, data_conclusao)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    texto,
    colunaDb,
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

  const colunaDb = paraBanco[coluna] || coluna;

  const query = `
    UPDATE tarefas
    SET texto = $1,
        coluna = $2,
        usuario_id = $3,
        projeto_id = $4,
        data_conclusao = $5
    WHERE id = $6
    RETURNING *
  `;

  const values = [
    texto,
    colunaDb,
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