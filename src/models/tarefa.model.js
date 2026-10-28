const prisma = require("../database/db");

// Objeto de inclusão exato com base no schema.prisma
const incluirNomes = {
  projetos: { select: { nome: true } },
  usuarios: { select: { nome: true } },
  prioridades: { select: { nome: true } },
};

// Converte do valor da base de dados (todo/doing/done) para o padrão do Frontend (afazer/andamento/concluido)
function mapearColunaParaFront(coluna) {
  if (coluna === "todo") return "afazer";
  if (coluna === "doing") return "andamento";
  if (coluna === "done") return "concluido";
  return coluna || "afazer";
}

// Converte do Frontend/Postman para a constraint do Banco de Dados
function mapearColunaParaBanco(coluna) {
  if (!coluna) return "todo";
  const c = coluna.toLowerCase();
  if (c === "afazer" || c === "a_fazer" || c === "todo") return "todo";
  if (c === "andamento" || c === "em_andamento" || c === "doing") return "doing";
  if (c === "concluido" || c === "concluida" || c === "done") return "done";
  return c;
}

// Formata a tarefa devolvendo estritamente os campos necessários em camelCase sem duplicações
function formatarTarefa(tarefa) {
  if (!tarefa) return null;

  return {
    id: tarefa.id,
    texto: tarefa.texto,
    coluna: mapearColunaParaFront(tarefa.coluna || tarefa.status),
    ordem: tarefa.ordem ?? 0,
    usuarioId: tarefa.usuario_id || tarefa.usuarioId,
    projetoId: tarefa.projeto_id || tarefa.projetoId || null,
    prioridadeId: tarefa.prioridade_id || tarefa.prioridadeId || 1,
    usuario: tarefa.usuarios?.nome || tarefa.usuario || null,
    projeto: tarefa.projetos?.nome || tarefa.projeto || null,
    prioridade: tarefa.prioridades?.nome || tarefa.prioridade || "Média",
    criadoEm: tarefa.criado_em || tarefa.data_criacao,
    iniciadaEm: tarefa.iniciada_em || tarefa.data_inicio,
    concluidaEm: tarefa.concluida_em || tarefa.data_conclusao,
  };
}

// Retorna o modelo do Prisma
const getModel = () => prisma.tarefa || prisma.tarefas;

async function listar() {
  const tarefas = await getModel().findMany({
    orderBy: { id: "asc" },
    include: incluirNomes,
  });
  return tarefas.map(formatarTarefa);
}

async function buscar(id) {
  const tarefa = await getModel().findUnique({
    where: { id: Number(id) },
    include: incluirNomes,
  });
  return formatarTarefa(tarefa);
}

async function listarPorColuna(coluna) {
  const model = getModel();
  const colunaBanco = mapearColunaParaBanco(coluna);
  let tarefas;
  try {
    tarefas = await model.findMany({
      where: { coluna: colunaBanco },
      include: incluirNomes,
    });
  } catch (e) {
    tarefas = await model.findMany({
      where: { status: coluna },
      include: incluirNomes,
    });
  }
  return tarefas.map(formatarTarefa);
}

async function listarPorUsuario(usuarioId) {
  const model = getModel();
  const tarefas = await model.findMany({
    where: { usuario_id: Number(usuarioId) },
    include: incluirNomes,
  });
  return tarefas.map(formatarTarefa);
}

async function listarPorProjeto(projetoId) {
  const model = getModel();
  const tarefas = await model.findMany({
    where: { projeto_id: Number(projetoId) },
    include: incluirNomes,
  });
  return tarefas.map(formatarTarefa);
}

async function adicionar(dados) {
  const { texto, coluna, usuario_id, usuarioId, projeto_id, projetoId, prioridade_id, idprioridade, ordem } = dados;

  const statusVal = mapearColunaParaBanco(coluna);
  const pId = Number(projeto_id || projetoId) || null;
  const uId = Number(usuario_id || usuarioId);
  const idPrio = Number(prioridade_id || idprioridade) || 1;
  const ord = Number(ordem) || 0;

  if (!uId || isNaN(uId)) {
    throw new Error("usuario_id válido é obrigatório.");
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
      const erroCustom = new Error("Um dos ids informados não existe");
      erroCustom.statusCode = 400;
      throw erroCustom;
    }
    throw erro;
  }
}

async function atualizar(id, dados) {
  const atual = await getModel().findUnique({
    where: { id: Number(id) },
  });

  if (!atual) return null;

  let iniciadaEm = atual.iniciada_em;
  let concluidaEm = atual.concluida_em;

  const colunaFrontend = dados.coluna !== undefined ? dados.coluna : mapearColunaParaFront(atual.coluna);
  const statusVal = mapearColunaParaBanco(colunaFrontend);

  if (statusVal === "doing" && !iniciadaEm) {
    iniciadaEm = new Date();
  }

  if (statusVal === "done" && !concluidaEm) {
    concluidaEm = new Date();
  }

  const pId = dados.projeto_id !== undefined || dados.projetoId !== undefined
    ? Number(dados.projeto_id || dados.projetoId) || null
    : atual.projeto_id;

  const uId = dados.usuario_id !== undefined || dados.usuarioId !== undefined
    ? Number(dados.usuario_id || dados.usuarioId)
    : atual.usuario_id;

  const idPrio = dados.prioridade_id !== undefined || dados.idprioridade !== undefined
    ? Number(dados.prioridade_id || dados.idprioridade)
    : atual.prioridade_id;

  try {
    const tarefa = await getModel().update({
      where: { id: Number(id) },
      data: {
        texto: dados.texto !== undefined ? dados.texto : atual.texto,
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
      const erroCustom = new Error("Um dos ids informados não existe");
      erroCustom.statusCode = 400;
      throw erroCustom;
    }
    throw erro;
  }
}

async function remover(id) {
  try {
    const tarefa = await getModel().delete({
      where: { id: Number(id) },
      include: incluirNomes,
    });
    return formatarTarefa(tarefa);
  } catch (erro) {
    if (erro.code === "P2025") return null;
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