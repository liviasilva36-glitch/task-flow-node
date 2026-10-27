const prisma = require("../database/db");

// Formata a tarefa para o padrão esperado pelo Frontend
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  return {
    id: tarefa.id,
    texto: tarefa.texto,
    coluna: tarefa.status || tarefa.coluna || "afazer",
    usuarioId: tarefa.usuario_id,
    projetoId: tarefa.projeto_id,
    dataConclusao: tarefa.data_conclusao || tarefa.concluida_em,
  };
}

async function listar() {
  const tarefas = await prisma.tarefas.findMany({
    orderBy: { id: "asc" },
  });
  return tarefas.map(formatarTarefa);
}

async function buscar(id) {
  const tarefa = await prisma.tarefas.findUnique({
    where: { id: Number(id) },
  });
  return formatarTarefa(tarefa);
}

async function listarPorColuna(coluna) {
  const tarefas = await prisma.tarefas.findMany({
    where: { status: coluna },
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorUsuario(usuarioId) {
  const tarefas = await prisma.tarefas.findMany({
    where: { usuario_id: Number(usuarioId) },
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorProjeto(projetoId) {
  const tarefas = await prisma.tarefas.findMany({
    where: { projeto_id: Number(projetoId) },
  });
  return tarefas.map(formatarTarefa);
}

async function adicionar(dados) {
  const { texto, coluna, usuarioId, projetoId, dataConclusao } = dados;

  const statusDb = coluna || "afazer";
  const pId = projetoId ? Number(projetoId) : 1;

  const novaTarefa = await prisma.tarefas.create({
    data: {
      texto,
      status: statusDb,
      usuario_id: Number(usuarioId),
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
  const usuarioId = dados.usuarioId !== undefined ? dados.usuarioId : tarefaAtual.usuarioId;
  const projetoId = dados.projetoId !== undefined ? dados.projetoId : tarefaAtual.projetoId;
  const dataConclusao = dados.dataConclusao !== undefined ? dados.dataConclusao : tarefaAtual.dataConclusao;

  const statusDb = coluna || "afazer";

  const tarefaAtualizada = await prisma.tarefas.update({
    where: { id: Number(id) },
    data: {
      texto,
      status: statusDb,
      usuario_id: Number(usuarioId),
      projeto_id: Number(projetoId),
      data_conclusao: dataConclusao ? new Date(dataConclusao) : null,
    },
  });

  return formatarTarefa(tarefaAtualizada);
}

async function remover(id) {
  const tarefaRemovida = await prisma.tarefas.delete({
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