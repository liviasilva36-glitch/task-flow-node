const prisma = require("../database/db");

// Formata a tarefa para o padrão esperado pelo Frontend
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  return {
    id: tarefa.id,
    texto: tarefa.texto,
    coluna: tarefa.status || tarefa.coluna || "afazer",
    prioridade: tarefa.prioridade || "media",
    usuarioId: tarefa.usuario_id,
    projetoId: tarefa.projeto_id,
    dataConclusao: tarefa.data_conclusao || tarefa.concluida_em,
  };
}

// Garante o acesso correto ao modelo (singular ou plural) no Prisma
const getModel = () => prisma.tarefa || prisma.tarefas;

async function listar() {
  const tarefas = await getModel().findMany({
    orderBy: { id: "asc" },
  });
  return tarefas.map(formatarTarefa);
}

async function buscar(id) {
  const tarefa = await getModel().findUnique({
    where: { id: Number(id) },
  });
  return formatarTarefa(tarefa);
}

async function listarPorColuna(coluna) {
  const tarefas = await getModel().findMany({
    where: { status: coluna },
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorUsuario(usuarioId) {
  const tarefas = await getModel().findMany({
    where: { usuario_id: Number(usuarioId) },
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorProjeto(projetoId) {
  const tarefas = await getModel().findMany({
    where: { projeto_id: Number(projetoId) },
  });
  return tarefas.map(formatarTarefa);
}

async function adicionar(dados) {
  const { texto, coluna, usuarioId, projetoId, dataConclusao, prioridade } = dados;

  const statusDb = coluna || "afazer";
  const pId = projetoId && !isNaN(Number(projetoId)) ? Number(projetoId) : null;
  const uId = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : null;

  if (!uId) {
    throw new Error("ID do usuário inválido ou ausente para vincular a tarefa.");
  }

  const novaTarefa = await getModel().create({
    data: {
      texto,
      status: statusDb,
      prioridade: prioridade || "media",
      usuario_id: uId,
      projeto_id: pId,
      data_conclusao: dataConclusao ? new Date(dataConclusao) : null,
    },
  });

  return formatarTarefa(novaTarefa);
}

async function atualizar(id, dados) {
  const tarefaAtual = await buscar(id);
  if (!tarefaAtual) {
    return null;
  }

  const texto = dados.texto !== undefined ? dados.texto : tarefaAtual.texto;
  const coluna = dados.coluna !== undefined ? dados.coluna : tarefaAtual.coluna;
  const prioridade = dados.prioridade !== undefined ? dados.prioridade : tarefaAtual.prioridade;
  const usuarioId = dados.usuarioId !== undefined ? dados.usuarioId : tarefaAtual.usuarioId;
  const projetoId = dados.projetoId !== undefined ? dados.projetoId : tarefaAtual.projetoId;
  const dataConclusao = dados.dataConclusao !== undefined ? dados.dataConclusao : tarefaAtual.dataConclusao;

  const statusDb = coluna || "afazer";
  const pId = projetoId && !isNaN(Number(projetoId)) ? Number(projetoId) : null;
  const uId = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : tarefaAtual.usuarioId;

  const tarefaAtualizada = await getModel().update({
    where: { id: Number(id) },
    data: {
      texto,
      status: statusDb,
      prioridade,
      usuario_id: uId,
      projeto_id: pId,
      data_conclusao: dataConclusao ? new Date(dataConclusao) : null,
    },
  });

  return formatarTarefa(tarefaAtualizada);
}

async function remover(id) {
  const tarefaRemovida = await getModel().delete({
    where: { id: Number(id) },
  });
  return formatarTarefa(tarefaRemovida);
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