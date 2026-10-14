const usuarioModel = require("../models/usuario.model");

const usuariosController = {
  async listar(req, res) {
    try {
      const usuarios = await usuarioModel.listar();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioModel.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado!",
        });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async criar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          erro: "Nome, email e senha são obrigatórios.",
        });
      }

      const usuarioExistente = await usuarioModel.buscarPorEmail(email);

      if (usuarioExistente) {
        return res.status(409).json({
          erro: "Email já cadastrado! Tente outro.",
        });
      }

      const novoUsuario = await usuarioModel.criar(nome, email, senha);

      res.status(201).json(novoUsuario);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);

      const usuarioExistente = await usuarioModel.buscarPorId(id);

      if (!usuarioExistente) {
        return res.status(404).json({
          erro: "Usuário não encontrado!",
        });
      }

      const { nome, email, senha } = req.body;

      if (email) {
        const emailExistente = await usuarioModel.buscarPorEmail(email);

        if (emailExistente && emailExistente.id !== id) {
          return res.status(409).json({
            erro: "Este email já está cadastrado.",
          });
        }
      }

      const usuarioAtualizado = await usuarioModel.atualizar(id, {
        nome,
        email,
        senha,
      });

      res.json(usuarioAtualizado);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async remover(req, res) {
    try {
      const id = Number(req.params.id);

      const usuario = await usuarioModel.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado!",
        });
      }

      await usuarioModel.remover(id);

      res.json({
        mensagem: "Usuário removido com sucesso!",
        id,
      });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },
};

module.exports = usuariosController;