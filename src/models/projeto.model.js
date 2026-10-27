const prisma = require("../database/db");

// Suporta esquemas do Prisma com nomes 'projeto' ou 'projetos'
const db = prisma.projeto || prisma.projetos;

async function listar() {
  return await db.findMany({
    orderBy: {
      nome: "asc",
    },
    // Corrigido de 'usuario' para 'usuarios'
    include: {
      usuarios: {
        select: {
          nome: true,
        },
      },
    },
  });
}

async function buscarPorId(id) {
  const projeto = await db.findUnique({
    where: {
      id: Number(id),
    },
    // Corrigido de 'usuario' para 'usuarios'
    include: {
      usuarios: {
        select: {
          nome: true,
        },
      },
    },
  });

  return projeto || null;
}

async function criar(dados) {
  const { nome, descricao, usuario_id } = dados;

  return await db.create({
    data: {
      nome,
      descricao,
      usuario_id: usuario_id ? Number(usuario_id) : undefined,
    },
    // Corrigido de 'usuario' para 'usuarios'
    include: {
      usuarios: {
        select: {
          nome: true,
        },
      },
    },
  });
}

async function atualizar(id, dados) {
  const projetoAtual = await buscarPorId(id);
  if (!projetoAtual) return null;

  const dataToUpdate = {};
  if (dados.nome !== undefined) dataToUpdate.nome = dados.nome;
  if (dados.descricao !== undefined) dataToUpdate.descricao = dados.descricao;
  if (dados.usuario_id !== undefined) dataToUpdate.usuario_id = Number(dados.usuario_id);

  return await db.update({
    where: {
      id: Number(id),
    },
    data: dataToUpdate,
    // Corrigido de 'usuario' para 'usuarios'
    include: {
      usuarios: {
        select: {
          nome: true,
        },
      },
    },
  });
}

async function remover(id) {
  try {
    return await db.delete({
      where: {
        id: Number(id),
      },
    });
  } catch (error) {
    return null;
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};