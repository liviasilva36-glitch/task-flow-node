const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require ('dotenv');
dotenv.config();

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Validação simples de credenciais (simulação)
  if (email !== 'analiiv@email.com' || senha !== '123456') {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  // Usa a variável de ambiente OU uma chave padrão
  const secretKey = process.env.JWT_SECRET || 'sua_chave_secreta_padrao_123';
  const usuario = { id: 1, nome: 'Ana', email };
  
  // Geração do token JWT
  const token = jwt.sign(
    usuario,
    secretKey,
    { expiresIn: '1h' }
  );

  return res.json({ token, usuario });
});

module.exports = router;