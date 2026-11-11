const prisma = require("../database/db");

// Relacionamentos incluídos nas consultas
const incluirNomes = {
  projetos: {
    select: { nome: true },
  },
  usuarios: {
    select: { nome: true },
  },
  prioridades: {
    select: { nome: true, descrição: true, cor: true },
  },
};

// Converte a coluna do banco para o padrão do frontend
function mapearColunaParaFront(coluna) {
  if (coluna === "todo") return "afazer";
  if (coluna === "doing") return "andamento";
  if (coluna === "done") return "concluido";

  return coluna || "afazer";
}

// Converte a coluna do frontend para o padrão do banco
function mapearColunaParaBanco(coluna) {
  if (!coluna) return "todo";

  const c = String(coluna).toLowerCase();

  if (["afazer", "a_fazer", "todo"].includes(c)) {
    return "todo";
  }

  if (["andamento", "em_andamento", "doing"].includes(c)) {
    return "doing";
  }

  if (["concluido", "concluida", "done"].includes(c)) {
    return "done";
  }

  return c;
}

// Formata os dados devolvidos ao frontend
function formatarTarefa(tarefa) {
  if (!tarefa) return null;

  return {
    id: tarefa.id,
    texto: tarefa.texto,
    coluna: mapearColunaParaFront(tarefa.coluna || tarefa.status),
    ordem: tarefa.ordem ?? 0,

    usuarioId: tarefa.usuario_id ?? tarefa.usuarioId,
    projetoId: tarefa.projeto_id ?? tarefa.projetoId ?? null,
    prioridadeId: tarefa.prioridade_id ?? tarefa.prioridadeId ?? 1,

    usuario: tarefa.usuarios?.nome || tarefa.usuario || null,
    projeto: tarefa.projetos?.nome || tarefa.projeto || null,
    prioridade: tarefa.prioridades?.descrição || tarefa.prioridade || "Média",
    prioridade_cor: tarefa.prioridades?.cor || tarefa.prioridade_cor || "#ccc",

    criadoEm: tarefa.criado_em || tarefa.data_criacao,
    iniciadaEm: tarefa.iniciada_em || tarefa.data_inicio,
    concluidaEm: tarefa.concluida_em || tarefa.data_conclusao,
  };
}

// Obtém o model de tarefas do Prisma
const getModel = () => prisma.tarefa || prisma.tarefas;

// Lista todas as tarefas
async function listar() {
  const tarefas = await getModel().findMany({
    orderBy: { id: "asc" },
    include: incluirNomes,
  });

  return tarefas.map(formatarTarefa);
}

// Busca uma tarefa pelo ID
async function buscar(id) {
  const tarefa = await getModel().findUnique({
    where: { id: Number(id) },
    include: incluirNomes,
  });

  return formatarTarefa(tarefa);
}

// Lista tarefas por coluna
async function listarPorColuna(coluna) {
  const model = getModel();
  const colunaBanco = mapearColunaParaBanco(coluna);

  let tarefas;

  try {
    tarefas = await model.findMany({
      where: { coluna: colunaBanco },
      include: incluirNomes,
    });
  } catch (erro) {
    tarefas = await model.findMany({
      where: { status: coluna },
      include: incluirNomes,
    });
  }

  return tarefas.map(formatarTarefa);
}

// Lista tarefas por usuário
async function listarPorUsuario(usuarioId) {
  const tarefas = await getModel().findMany({
    where: { usuario_id: Number(usuarioId) },
    include: incluirNomes,
  });

  return tarefas.map(formatarTarefa);
}

// Lista tarefas por projeto
async function listarPorProjeto(projetoId) {
  const tarefas = await getModel().findMany({
    where: { projeto_id: Number(projetoId) },
    include: incluirNomes,
  });

  return tarefas.map(formatarTarefa);
}

// CRIAR TAREFA
async function adicionar(dados) {
  const {
    texto,
    coluna,
    usuario_id,
    usuarioId,
    projeto_id,
    projetoId,
    prioridade_id,
    prioridadeId,
    idprioridade,
    id_prioridade,
    ordem,
  } = dados;

  const statusVal = mapearColunaParaBanco(coluna);

  // ID do projeto
  const rawPId = projeto_id ?? projetoId;

  const pId =
    rawPId && !isNaN(Number(rawPId))
      ? Number(rawPId)
      : null;

  // ID do usuário
  const rawUId = usuario_id ?? usuarioId;

  const uId =
    rawUId && !isNaN(Number(rawUId))
      ? Number(rawUId)
      : null;

  // ID da prioridade
  const rawPrioId =
    prioridade_id ??
    prioridadeId ??
    idprioridade ??
    id_prioridade;

  const idPrio = Number(rawPrioId);

  const ord = Number(ordem) || 0;

  if (!uId) {
    const erroCustom = new Error(
      "usuario_id válido é obrigatório."
    );

    erroCustom.statusCode = 400;
    throw erroCustom;
  }

  if (![1, 2, 3].includes(idPrio)) {
    const erroCustom = new Error(
      "ID de prioridade inválido."
    );

    erroCustom.statusCode = 400;
    throw erroCustom;
  }

  try {
    const novaTarefa = await getModel().create({
      data: {
        texto,
        coluna: statusVal,
        ordem: ord,
        prioridade_id: idPrio,
        usuario_id: uId,
        projeto_id: pId,
      },
      include: incluirNomes,
    });

    return formatarTarefa(novaTarefa);

  } catch (erro) {
    if (erro.code === "P2003") {
      const erroCustom = new Error(
        "Um dos ids informados não existe"
      );

      erroCustom.statusCode = 400;
      throw erroCustom;
    }

    throw erro;
  }
}

// ATUALIZAR TAREFA
async function atualizar(id, dados) {
  const idNum = Number(id);

  if (isNaN(idNum)) return null;

  // Busca a tarefa atual
  const atual = await getModel().findUnique({
    where: { id: idNum },
  });

  if (!atual) return null;

  let iniciadaEm = atual.iniciada_em;
  let concluidaEm = atual.concluida_em;

  const colunaFrontend =
    dados.coluna !== undefined
      ? dados.coluna
      : mapearColunaParaFront(atual.coluna);

  const statusVal = mapearColunaParaBanco(colunaFrontend);

  if (statusVal === "doing" && !iniciadaEm) {
    iniciadaEm = new Date();
  }

  if (statusVal === "done" && !concluidaEm) {
    concluidaEm = new Date();
  }

  // Mantém a prioridade atual quando nenhuma nova for enviada
  let idPrio = atual.prioridade_id;

  const rawPrio =
    dados.prioridade_id ??
    dados.prioridadeId ??
    dados.idprioridade ??
    dados.id_prioridade;

  if (rawPrio !== undefined && rawPrio !== null && rawPrio !== "") {
    const novaPrioridade = Number(rawPrio);

    if (![1, 2, 3].includes(novaPrioridade)) {
      const erroCustom = new Error("ID de prioridade inválido.");
      erroCustom.statusCode = 400;
      throw erroCustom;
    }

    idPrio = novaPrioridade;
  }

  // Mantém o usuário atual quando nenhum novo for enviado
  let uId = atual.usuario_id;

  const rawUser = dados.usuario_id ?? dados.usuarioId;

  if (
    rawUser !== undefined &&
    rawUser !== null &&
    !isNaN(Number(rawUser)) &&
    Number(rawUser) > 0
  ) {
    uId = Number(rawUser);
  }

  // Mantém ou atualiza o projeto
  let pId = atual.projeto_id;

  const rawProj = dados.projeto_id ?? dados.projetoId;

  if (rawProj !== undefined) {
    pId =
      rawProj && !isNaN(Number(rawProj)) && Number(rawProj) > 0
        ? Number(rawProj)
        : null;
  }

  try {
    const tarefa = await getModel().update({
      where: { id: idNum },

      data: {
        texto:
          dados.texto !== undefined
            ? dados.texto
            : atual.texto,

        coluna: statusVal,
        prioridade_id: idPrio,
        usuario_id: uId,
        projeto_id: pId,
        iniciada_em: iniciadaEm,
        concluida_em: concluidaEm,
      },

      include: incluirNomes,
    });

    return formatarTarefa(tarefa);

  } catch (erro) {
    if (erro.code === "P2003") {
      const erroCustom = new Error(
        "Um dos ids informados não existe"
      );

      erroCustom.statusCode = 400;
      throw erroCustom;
    }

    throw erro;
  }
}

// REMOVER TAREFA
async function remover(id) {
  try {
    const tarefa = await getModel().delete({
      where: { id: Number(id) },
      include: incluirNomes,
    });

    return formatarTarefa(tarefa);

  } catch (erro) {
    if (erro.code === "P2025") {
      return null;
    }

    throw erro;
  }
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