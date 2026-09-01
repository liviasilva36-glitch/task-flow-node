console.log("Iniciando o servidor...");

const express = require("express");
const app = express();
const PORTA = 3000;

// Importação dos roteadores modularizados
const tarefasRoutes = require('./src/routes/tarefas.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');

// Middleware global para leitura de JSON
app.use(express.json());

// Base de dados em memória para estatísticas
let tarefas = [
  { id: 1, texto: "Estudar Node", coluna: "afazer", prioridade: "baixa" },
  { id: 2, texto: "Criar API", prioridade: "alta", coluna: "andamento" },
  { id: 3, texto: "Testar Postman", prioridade: "media", coluna: "concluido" }
];

// --- 1. ROTA RAIZ ---
app.get("/", (req, res) => {
  res.json({ api: "TaskFlow", versao: "1.0", status: "online" });
});

// --- 2. REGISTRO DAS ROTAS MODULARIZADAS ---
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);

// --- 3. ROTAS DE ESTATÍSTICAS ---
app.get("/estatisticas/resumo", (req, res) => {
  const total = tarefas.length;
  const concluida = tarefas.filter((t) => t.coluna === "concluido").length;
  const andamento = tarefas.filter((t) => t.coluna === "andamento").length;
  const afazer = tarefas.filter((t) => t.coluna === "afazer").length;

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

app.get("/estatisticas", (req, res) => {
  const { coluna } = req.query;
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

// --- 4. TRATAMENTO DE ROTAS NÃO ENCONTRADAS (404) ---
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// --- 5. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});