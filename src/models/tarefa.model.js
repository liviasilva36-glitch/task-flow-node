const prisma = require("../database/db");

// Formata o objeto do Prisma para o padrão JSON esperado pelo Frontend
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  return {
    id: tarefa.id,
    texto: tarefa.texto || tarefa.titulo || tarefa.descricao,
    coluna: tarefa.status || "afazer",
    usuarioId: tarefa.usuario_id || tarefa.usuarioId,
    projetoId: tarefa.projeto_id || tarefa.projetoId,
    dataConclusao: tarefa.data_conclusao || tarefa.dataConclusao,
  };
}

async function listar() {
  const tarefas = await prisma.tarefa.findMany({
    orderBy: { id: "asc" },
  });
  return tarefas.map(formatarTarefa);
}

async function buscar(id) {
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: Number(id) },
  });
  return formatarTarefa(tarefa);
}

async function listarPorColuna(coluna) {
  const tarefas = await prisma.tarefa.findMany({
    where: { status: coluna },
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorUsuario(usuarioId) {
  const tarefas = await prisma.tarefa.findMany({
    where: { usuario_id: Number(usuarioId) },
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorProjeto(projetoId) {
  const tarefas = await prisma.tarefa.findMany({
    where: { projeto_id: Number(projetoId) },
  });
  return tarefas.map(formatarTarefa);
}

async function adicionar(dados) {
  const { texto, coluna, usuarioId, projetoId, dataConclusao } = dados;

  const statusDb = coluna || "afazer";
  const pId = projetoId ? Number(projetoId) : 1;

  const novaTarefa = await prisma.tarefa.create({
    data: {
      texto,
      status: statusDb,
      usuario_id: usuarioId ? Number(usuarioId) : null,
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

  const tarefaAtualizada = await prisma.tarefa.update({
    where: { id: Number(id) },
    data: {
      texto,
      status: statusDb,
      usuario_id: usuarioId ? Number(usuarioId) : null,
      projeto_id: projetoId ? Number(projetoId) : 1,
      data_conclusao: dataConclusao ? new Date(dataConclusao) : null,
    },
  });

  return formatarTarefa(tarefaAtualizada);
}

async function remover(id) {
  const tarefaRemovida = await prisma.tarefa.delete({
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