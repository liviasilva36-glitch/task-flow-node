console.log("Iniciando o servidor...");

const express = require("express");
const app = express();
const PORTA = 3000;

// Base de dados simulada
const tarefas = [
  { id: 1, texto: "Estudar Express", coluna: "afazer", prioridade: "alta" },
  { id: 2, texto: "Criar rotas GET", coluna: "em_andamento", prioridade: "media" },
  { id: 3, texto: "Testar no Postman", coluna: "afazer", prioridade: "alta" }
];

const usuarios = [
  { id: 1, nome: "admin", email: "admin@taskflow.com" },
  { id: 2, nome: "desenvolvedor", email: "dev@taskflow.com" }
];

// ROTA 1 — Status da API
app.get("/", (req, res) => {
  res.json({ api: "TaskFlow", versao: "1.0", status: "online" });
});

// ROTA 2, ROTA 4 e DESAFIO — Listar tarefas e aplicar filtros (?coluna=... &prioridade=...)
app.get("/tarefas", (req, res) => {
  const { coluna, prioridade } = req.query;
  let resultado = tarefas;

  if (coluna) {
    resultado = resultado.filter((t) => t.coluna === coluna);
  }
  if (prioridade) {
    resultado = resultado.filter((t) => t.prioridade === prioridade);
  }

  res.json(resultado);
});

// ROTA 3 — Buscar tarefa por ID
app.get("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);
  const tarefa = tarefas.find((t) => t.id === id);

  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada" });
  }

  res.json(tarefa);
});

// ROTA 5 — Listar usuários
app.get("/usuarios", (req, res) => {
  res.json(usuarios);
});

// ROTA 6 — 404 Genérico (Deve ser declarado após todas as outras rotas)
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});