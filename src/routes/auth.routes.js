const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Validação simples de credenciais (simulação)
  if (email !== 'analiiv@email.com' || senha !== '123456') {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  // Geração do token JWT com payload e a chave do .env
  const token = jwt.sign(
    { id: 1, nome: 'Alice', email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({ token });
});

module.exports = router;