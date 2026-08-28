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

// --- ROTAS DE ESTATÍSTICAS ---

// Nível 2: Resumo em texto descritivo
app.get("/estatisticas/resumo", (req, res) => {
  const total = tarefas.length;
  const concluida = tarefas.filter((t) => t.coluna === "concluido").length;
  const andamento = tarefas.filter((t) => t.coluna === "andamento").length;
  const afazer = tarefas.filter((t) => t.coluna === "afazer").length;

  // Calcula a prioridade mais frequente
  const contagemPrioridade = { alta: 0, media: 0, baixa: 0 };
  tarefas.forEach((t) => {
    if (t.prioridade && contagemPrioridade[t.prioridade] !== undefined) {
      contagemPrioridade[t.prioridade]++;
    }
  });

  let prioridadeMaisComum = "nenhuma";
  let maxPrio = 0;
  for (const [prio, qtd] of Object.entries(contagemPrioridade)) {
    if (qtd > maxPrio) {
      maxPrio = qtd;
      prioridadeMaisComum = prio;
    }
  }

  const frase = `Você tem ${total} tarefas. ${concluida} concluida(s), ${andamento} em andamento e ${afazer} a fazer. Prioridade mais comum: ${prioridadeMaisComum}.`;

  res.json({ resumo: frase });
});

// Rota base + Nível 1: Estatísticas completas com filtro opcional por coluna
app.get("/estatisticas", (req, res) => {
  const { coluna } = req.query;

  // Filtra por coluna se o Query Param for fornecido
  const lista = coluna ? tarefas.filter((t) => t.coluna === coluna) : tarefas;

  const porColuna = {
    afazer: lista.filter((t) => t.coluna === "afazer").length,
    andamento: lista.filter((t) => t.coluna === "andamento").length,
    concluido: lista.filter((t) => t.coluna === "concluido").length,
  };

  const porPrioridade = {
    alta: lista.filter((t) => t.prioridade === "alta").length,
    media: lista.filter((t) => t.prioridade === "media").length,
    baixa: lista.filter((t) => t.prioridade === "baixa").length,
  };

  // Identifica a coluna com maior quantidade de tarefas
  let colunaComMaisTarefas = "afazer";
  let maxQtd = -1;
  for (const [col, qtd] of Object.entries(porColuna)) {
    if (qtd > maxQtd) {
      maxQtd = qtd;
      colunaComMaisTarefas = col;
    }
  }

  res.json({
    totalGeral: lista.length,
    porColuna,
    porPrioridade,
    colunaComMaisTarefas,
  });
});

// --- ROTAS DE ESTATÍSTICAS ---

// Nível 2: Resumo em texto descritivo
app.get("/estatisticas/resumo", (req, res) => {
  const total = tarefas.length;
  const concluida = tarefas.filter((t) => t.coluna === "concluido").length;
  const andamento = tarefas.filter((t) => t.coluna === "andamento").length;
  const afazer = tarefas.filter((t) => t.coluna === "afazer").length;

  // Calcula a prioridade mais frequente
  const contagemPrioridade = { alta: 0, media: 0, baixa: 0 };
  tarefas.forEach((t) => {
    if (t.prioridade && contagemPrioridade[t.prioridade] !== undefined) {
      contagemPrioridade[t.prioridade]++;
    }
  });

  let prioridadeMaisComum = "nenhuma";
  let maxPrio = 0;
  for (const [prio, qtd] of Object.entries(contagemPrioridade)) {
    if (qtd > maxPrio) {
      maxPrio = qtd;
      prioridadeMaisComum = prio;
    }
  }

  const frase = `Você tem ${total} tarefas. ${concluida} concluida(s), ${andamento} em andamento e ${afazer} a fazer. Prioridade mais comum: ${prioridadeMaisComum}.`;

  res.json({ resumo: frase });
});

// Rota base + Nível 1: Estatísticas completas com filtro opcional por coluna
app.get("/estatisticas", (req, res) => {
  const { coluna } = req.query;

  // Filtra por coluna se o Query Param for fornecido
  const lista = coluna ? tarefas.filter((t) => t.coluna === coluna) : tarefas;

  const porColuna = {
    afazer: lista.filter((t) => t.coluna === "afazer").length,
    andamento: lista.filter((t) => t.coluna === "andamento").length,
    concluido: lista.filter((t) => t.coluna === "concluido").length,
  };

  const porPrioridade = {
    alta: lista.filter((t) => t.prioridade === "alta").length,
    media: lista.filter((t) => t.prioridade === "media").length,
    baixa: lista.filter((t) => t.prioridade === "baixa").length,
  };

  // Identifica a coluna com maior quantidade de tarefas
  let colunaComMaisTarefas = "afazer";
  let maxQtd = -1;
  for (const [col, qtd] of Object.entries(porColuna)) {
    if (qtd > maxQtd) {
      maxQtd = qtd;
      colunaComMaisTarefas = col;
    }
  }

  res.json({
    totalGeral: lista.length,
    porColuna,
    porPrioridade,
    colunaComMaisTarefas,
  });
});

// --- TRATAMENTO DE ROTAS NÃO ENCONTRADAS ---
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));







