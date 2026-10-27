const prisma = require("../database/db");

// Suporta esquemas do Prisma com nomes 'usuario', 'Usuario' ou 'usuarios'
const db = prisma.usuario || prisma.Usuario || prisma.usuarios;

const usuarioModel = {
  async listar() {
    return await db.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  },

  async buscarPorId(id) {
    return await db.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  },

  async buscarPorEmail(email) {
    return await db.findUnique({
      where: { email },
    });
  },

  async autenticar(email, senha) {
    let emailValor;
    let senhaValor;

    // Trata se o primeiro argumento for um objeto (ex: req.body enviado diretamente)
    if (typeof email === "object" && email !== null) {
      emailValor = email.email;
      senhaValor = email.senha;
    } else {
      emailValor = email;
      senhaValor = senha;
    }

    if (!emailValor || !senhaValor) {
      return null;
    }

    return await db.findFirst({
      where: {
        email: emailValor,
        senha_hash: senhaValor,
      },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  },

  async criar(nome, email, senha) {
    return await db.create({
      data: {
        nome,
        email,
        senha_hash: senha,
      },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  },

  async atualizar(id, dados) {
    const usuarioAtual = await this.buscarPorId(id);
    if (!usuarioAtual) {
      return null;
    }

    const dataToUpdate = {};
    if (dados && dados.nome !== undefined) dataToUpdate.nome = dados.nome;
    if (dados && dados.email !== undefined) dataToUpdate.email = dados.email;
    if (dados && dados.senha !== undefined) dataToUpdate.senha_hash = dados.senha;

    return await db.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  },

  async remover(id) {
    try {
      return await db.delete({
        where: { id: Number(id) },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });
    } catch (error) {
      return null;
    }
  },
};

module.exports = usuarioModel;