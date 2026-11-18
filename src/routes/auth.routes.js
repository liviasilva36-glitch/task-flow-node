const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const usuarioModel = require("../models/usuario.model");

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      });
    }

    const usuario = await usuarioModel.autenticar(email, senha);

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário ou senha incorretos",
      });
    }

    const secretKey = process.env.JWT_SECRET || "minha_chave_secreta_padrao";

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    const token = jwt.sign(payload, secretKey, {
      expiresIn: "1h",
    });

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
