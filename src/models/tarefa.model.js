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
  const c = String(coluna).toLowerCase();
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
  const { texto, coluna, usuario_id, usuarioId, projeto_id, projetoId, prioridade_id, prioridadeId, idprioridade, ordem } = dados;

  const statusVal = mapearColunaParaBanco(coluna);
  
  const rawPId = projeto_id ?? projetoId;
  const pId = rawPId && !isNaN(Number(rawPId)) ? Number(rawPId) : null;

  const rawUId = usuario_id ?? usuarioId;
  const uId = rawUId && !isNaN(Number(rawUId)) ? Number(rawUId) : null;

  const rawPrioId = prioridade_id ?? prioridadeId ?? idprioridade;
  const idPrio = rawPrioId && !isNaN(Number(rawPrioId)) ? Number(rawPrioId) : 1;

  const ord = Number(ordem) || 0;

  if (!uId) {
    const erroCustom = new Error("usuario_id válido é obrigatório.");
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
      const erroCustom = new Error("Um dos ids informados não existe");
      erroCustom.statusCode = 400;
      throw erroCustom;
    }
    throw erro;
  }
}

async function atualizar(id, dados) {
  const idNum = Number(id);
  if (isNaN(idNum)) return null;

  const atual = await getModel().findUnique({
    where: { id: idNum },
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

  // Resolução segura de projeto_id (suporta camelCase e snake_case)
  let pId = atual.projeto_id;
  if (dados.projeto_id !== undefined || dados.projetoId !== undefined) {
    const valorProj = dados.projeto_id ?? dados.projetoId;
    pId = valorProj && !isNaN(Number(valorProj)) ? Number(valorProj) : null;
  }

  // Resolução segura de usuario_id
  let uId = atual.usuario_id;
  if (dados.usuario_id !== undefined || dados.usuarioId !== undefined) {
    const valorUser = dados.usuario_id ?? dados.usuarioId;
    if (valorUser && !isNaN(Number(valorUser))) {
      uId = Number(valorUser);
    }
  }

  // Resolução segura de prioridade_id
  let idPrio = atual.prioridade_id;
  if (dados.prioridade_id !== undefined || dados.prioridadeId !== undefined || dados.idprioridade !== undefined) {
    const valorPrio = dados.prioridade_id ?? dados.prioridadeId ?? dados.idprioridade;
    if (valorPrio && !isNaN(Number(valorPrio))) {
      idPrio = Number(valorPrio);
    }
  }

  // Fallback para evitar enviar valor nulo ou NaN em prioridade/usuario
  if (!idPrio || isNaN(idPrio)) idPrio = 1;
  if (!uId || isNaN(uId)) uId = atual.usuario_id;

  try {
    const tarefa = await getModel().update({
      where: { id: idNum },
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