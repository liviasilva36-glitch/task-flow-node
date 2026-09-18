const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const usuarioModel = require("../models/usuario.model");

router.post("/login", (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verifica se os campos foram preenchidos
    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      });
    }

    // Procura o usuário no MODEL
    const usuario = usuarioModel.autenticar(email, senha);

    // Usuário ou senha incorretos
    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário ou senha incorretos",
      });
    }

    // Chave usada para criar o token
    const secretKey =
      process.env.JWT_SECRET ||
      "sua_chave_secreta_padrao_123";

    // Dados que vão dentro do token
    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    // Cria o token
    const token = jwt.sign(
      payload,
      secretKey,
      {
        expiresIn: "1h",
      }
    );

    // Resposta para o Front-end
    return res.json({
      token,
      usuario: payload,
    });

  } catch (erro) {
    console.error("ERRO NO LOGIN:", erro);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
});

module.exports = router;