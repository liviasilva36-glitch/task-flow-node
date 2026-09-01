const express = require('express');
const router = express.Router();

let usuarios = [
  { id: 1, nome: "admin", email: "admin@taskflow.com", senha: "1234" }
];
let proximoIdUsuario = 2;

// GET /usuarios - listar todos
router.get('/', (req, res) => {
  res.json(usuarios);
});

// GET /usuarios/:id - buscar por ID
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
  res.json(usuario);
});

// POST /usuarios - criar usuário
router.post('/', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios" });
  }

  const emailExiste = usuarios.some((u) => u.email === email);
  if (emailExiste) {
    return res.status(400).json({ erro: "Email já cadastrado" });
  }

  const novoUsuario = { id: proximoIdUsuario++, nome, email, senha };
  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

// PUT /usuarios/:id - atualizar usuário
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = usuarios.findIndex((u) => u.id === id);

  if (idx === -1) return res.status(404).json({ erro: "Usuário não encontrado" });

  usuarios[idx] = { ...usuarios[idx], ...req.body, id };
  res.json(usuarios[idx]);
});

// DELETE /usuarios/:id - remover usuário
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const usuarioExiste = usuarios.find((u) => u.id === id);

  if (!usuarioExiste) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  usuarios = usuarios.filter((u) => u.id !== id);
  res.json({ mensagem: "Usuário removido", id });
});

module.exports = router;