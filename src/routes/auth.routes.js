const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

// Importe a lista de usuários cadastrados no seu controller
// (Ajuste o caminho '../controllers/usuarios.controller' de acordo com sua estrutura)
const { usuarios } = require('../controllers/usuarios.controller');

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Busca se o e-mail e a senha existem na lista da TaskFlow
  const usuarioEncontrado = usuarios.find(
    (u) => u.email === email && u.senha === senha
  );

  // Se não encontrar o usuário ou a senha estiver errada
  if (!usuarioEncontrado) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
  }

  // Chave secreta para assinar o token
  const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_padrao_123';

  // Cria o token com as informações do usuário encontrado (removendo a senha por segurança)
  const payload = {
    id: usuarioEncontrado.id,
    nome: usuarioEncontrado.nome,
    email: usuarioEncontrado.email
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

  return res.json({ token, usuario: payload });
});

module.exports = router;