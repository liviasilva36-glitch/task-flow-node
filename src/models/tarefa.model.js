const prisma = require("../database/db");

// Formata a tarefa para o padrão esperado pelo Frontend
function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  return {
    id: tarefa.id,
    texto: tarefa.texto,
    coluna: tarefa.status || tarefa.coluna || "afazer",
    prioridade: tarefa.prioridade || "media",
    usuarioId: tarefa.usuario_id || tarefa.usuarioId,
    projetoId: tarefa.projeto_id || tarefa.projetoId,
    dataConclusao: tarefa.data_conclusao || tarefa.concluida_em || tarefa.dataConclusao,
  };
}

// Retorna dinamicamente o modelo do Prisma (singular ou plural)
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
  const model = getModel();
  let tarefas;
  try {
    tarefas = await model.findMany({ where: { status: coluna } });
  } catch (e) {
    tarefas = await model.findMany({ where: { coluna: coluna } });
  }
  return tarefas.map(formatarTarefa);
}

async function listarPorUsuario(usuarioId) {
  const model = getModel();
  let tarefas;
  try {
    tarefas = await model.findMany({ where: { usuario_id: Number(usuarioId) } });
  } catch (e) {
    tarefas = await model.findMany({ where: { usuarioId: Number(usuarioId) } });
  }
  return tarefas.map(formatarTarefa);
}

async function listarPorProjeto(projetoId) {
  const model = getModel();
  let tarefas;
  try {
    tarefas = await model.findMany({ where: { projeto_id: Number(projetoId) } });
  } catch (e) {
    tarefas = await model.findMany({ where: { projetoId: Number(projetoId) } });
  }
  return tarefas.map(formatarTarefa);
}

async function adicionar(dados) {
  const { texto, coluna, usuarioId, projetoId, dataConclusao, prioridade } = dados;

  const statusVal = coluna || "afazer";
  const pId = projetoId && !isNaN(Number(projetoId)) ? Number(projetoId) : null;
  const uId = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : null;

  if (!uId) {
    throw new Error("usuarioId válido é obrigatório.");
  }

  // Tenta criar utilizando a convenção snake_case (usuario_id)
  try {
    const novaTarefa = await getModel().create({
      data: {
        texto,
        status: statusVal,
        prioridade: prioridade || "media",
        usuario_id: uId,
        projeto_id: pId,
        data_conclusao: dataConclusao ? new Date(dataConclusao) : null,
      },
    });
    return formatarTarefa(novaTarefa);
  } catch (erroSnake) {
    // Se o schema usar camelCase (usuarioId / coluna), executa o fallback automático
    const novaTarefa = await getModel().create({
      data: {
        texto,
        coluna: statusVal,
        prioridade: prioridade || "media",
        usuarioId: uId,
        projetoId: pId,
        dataConclusao: dataConclusao ? new Date(dataConclusao) : null,
      },
    });
    return formatarTarefa(novaTarefa);
  }
}

async function atualizar(id, dados) {
  const tarefaAtual = await buscar(id);
  if (!tarefaAtual) return null;

  const texto = dados.texto !== undefined ? dados.texto : tarefaAtual.texto;
  const coluna = dados.coluna !== undefined ? dados.coluna : tarefaAtual.coluna;
  const prioridade = dados.prioridade !== undefined ? dados.prioridade : tarefaAtual.prioridade;
  const usuarioId = dados.usuarioId !== undefined ? dados.usuarioId : tarefaAtual.usuarioId;
  const projetoId = dados.projetoId !== undefined ? dados.projetoId : tarefaAtual.projetoId;
  const dataConclusao = dados.dataConclusao !== undefined ? dados.dataConclusao : tarefaAtual.dataConclusao;

  const pId = projetoId && !isNaN(Number(projetoId)) ? Number(projetoId) : null;
  const uId = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : tarefaAtual.usuarioId;

  try {
    const tarefaAtualizada = await getModel().update({
      where: { id: Number(id) },
      data: {
        texto,
        status: coluna,
        prioridade,
        usuario_id: uId,
        projeto_id: pId,
        data_conclusao: dataConclusao ? new Date(dataConclusao) : null,
      },
    });
    return formatarTarefa(tarefaAtualizada);
  } catch (erro) {
    const tarefaAtualizada = await getModel().update({
      where: { id: Number(id) },
      data: {
        texto,
        coluna,
        prioridade,
        usuarioId: uId,
        projetoId: pId,
        dataConclusao: dataConclusao ? new Date(dataConclusao) : null,
      },
    });
    return formatarTarefa(tarefaAtualizada);
  }
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