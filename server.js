console.log("Iniciando o servidor...");

const express = require("express");
const app = express();
const PORTA = 3000;

app.use(express.json());

// --- BASE DE DADOS: TAREFAS ---
let tarefas = [
  { id: 1, texto: "Estudar Node", coluna: "afazer" },
  { id: 2, texto: "Criar API", prioridade: "alta", coluna: "andamento" },
  { id: 3, texto: "Testar Postman", prioridade: "media", coluna: "concluido" }
];
let proximoId = 4;

// --- BASE DE DADOS: USUÁRIOS ---
let usuarios = [
  { id: 1, nome: "admin", email: "admin@taskflow.com", senha: "1234" }
];
let proximoIdUsuario = 2;

// --- ROTAS GERAIS ---
app.get("/", (req, res) => {
  res.json({ api: "TaskFlow", versao: "1.0", status: "online" });
});

// --- ROTAS DE TAREFAS ---
app.get("/tarefas", (req, res) => res.json(tarefas));

app.get("/tarefas/:id", (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: "Não encontrada" });
  res.json(tarefa);
});

app.post("/tarefas", (req, res) => {
  const nova = { id: proximoId++, ...req.body };
  tarefas.push(nova);
  res.status(201).json(nova);
});

app.put("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = tarefas.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ erro: "Não encontrada" });
  tarefas[idx] = { id, ...req.body };
  res.json(tarefas[idx]);
});

app.delete("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!tarefas.find((t) => t.id === id)) {
    return res.status(404).json({ erro: "Não encontrada" });
  }
  tarefas = tarefas.filter((t) => t.id !== id);
  res.json({ mensagem: "Removida", id });
});

// --- ROTAS DE USUÁRIOS ---

// 1. Listar todos os usuários
app.get("/usuarios", (req, res) => {
  res.json(usuarios);
});

// 2. Buscar usuário por ID
app.get("/usuarios/:id", (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
  res.json(usuario);
});

// 3. Criar usuário (com validação de e-mail único)
app.post("/usuarios", (req, res) => {
  const { nome, email, senha } = req.body;

  const emailExiste = usuarios.some((u) => u.email === email);
  if (emailExiste) {
    return res.status(400).json({ erro: "Email já cadastrado" });
  }

  const novoUsuario = { id: proximoIdUsuario++, nome, email, senha };
  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

// 4. Atualizar usuário
app.put("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = usuarios.findIndex((u) => u.id === id);

  if (idx === -1) return res.status(404).json({ erro: "Usuário não encontrado" });

  usuarios[idx] = { id, ...req.body };
  res.json(usuarios[idx]);
});

// 5. Deletar usuário
app.delete("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const usuarioExiste = usuarios.find((u) => u.id === id);

  if (!usuarioExiste) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  usuarios = usuarios.filter((u) => u.id !== id);
  res.json({ mensagem: "Usuário removido", id });
});

// --- TRATAMENTO DE ROTAS NÃO ENCONTRADAS ---
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));







