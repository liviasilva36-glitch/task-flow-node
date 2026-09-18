const usuarioModel = require("../models/usuario.model");

const usuariosController = {

  listar(req, res) {

    const usuarios = usuarioModel.listar();

    res.json(usuarios);
  },


  buscarPorId(req, res) {

    const id = Number(req.params.id);

    const usuario = usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado!"
      });
    }

    res.json(usuario);
  },


  criar(req, res) {

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios."
      });
    }

    const usuarioExistente =
      usuarioModel.buscarPorEmail(email);

    if (usuarioExistente) {
      return res.status(409).json({
        erro: "Email já cadastrado! Tente outro."
      });
    }

    const novoUsuario =
      usuarioModel.criar(
        nome,
        email,
        senha
      );

    res.status(201).json(novoUsuario);
  },


  atualizar(req, res) {

    const id = Number(req.params.id);

    const usuarioExistente =
      usuarioModel.buscarPorId(id);

    if (!usuarioExistente) {
      return res.status(404).json({
        erro: "Usuário não encontrado!"
      });
    }

    const { nome, email, senha } = req.body;

    if (email) {

      const emailExistente =
        usuarioModel.buscarPorEmail(email);

      if (
        emailExistente &&
        emailExistente.id !== id
      ) {
        return res.status(409).json({
          erro: "Este email já está cadastrado."
        });
      }
    }

    const usuarioAtualizado =
      usuarioModel.atualizar(id, {
        nome,
        email,
        senha
      });

    res.json(usuarioAtualizado);
  },


  remover(req, res) {

    const id = Number(req.params.id);

    const usuario =
      usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado!"
      });
    }

    usuarioModel.remover(id);

    res.json({
      mensagem: "Usuário removido com sucesso!",
      id
    });
  }
};

module.exports = usuariosController;