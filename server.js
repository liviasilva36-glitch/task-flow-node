console.log("Iniciando o servidor...");

const express = require("express");
const app = express();
const PORTA = 3000;

const tarefas = [{ id: 1, texto: "Estudar Node", coluna: "afazer" },
{ id: 2, texto: 'Criar API', prioridade: 'alta', coluna: 'andamento' },
{ id: 3, texto: 'Testar Postman', prioridade: 'media', coluna: 'concluido' }
];


// Rotas
app.get('/tarefas', (req, res) => {

  // req.query contém os filtros da URL

  const { coluna, prioridade } = req.query;

  // Começar com todas as tarefas

  let resultado = tarefas;

  // Filtrar por coluna se informado

  if (coluna) {

    resultado = resultado.filter(t => t.coluna === coluna);

  }

  // Filtrar por prioridade se informado

  if (prioridade) {

    resultado = resultado.filter(t => t.prioridade === prioridade);

  }

  res.json(resultado);

});


app.get("/", (req, res) => {
  res.json({ api: 'TaskFlow', versao: '1.0', status: 'online' });
});

app.get("/tarefas", (req, res) => {

  // Token sem o espaço no meio do UUID
  if (req.headers['tokenpi'] === '597181df-979f-4b06-969c-fe231cc5cec11') {
    res.json(tarefas);
  } else {
    res.status(401).json({ erro: "acesso negado" });
  }
});
app.get('/tarefas/:id', (req, res) => {

  // req.params.id chega como STRING — converter para número
  const id = Number(req.params.id);

  // Buscar a tarefa no array
  const tarefa = tarefas.find(t => t.id === id);

  // Se não encontrou — retornar 404
  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa não encontrada' });
  }

  // Se encontrou — retornar a tarefa
  res.json(tarefa);
});


app.get('/ok', (req, res) => {
  res.json({ status: 'ok', dados: [1, 2, 3] });
});

app.get('/criado', (req, res) => {
  res.status(201).json({ mensagem: 'Criado com sucesso' });
});

app.get('/erro', (req, res) => {
  res.status(400).json({ erro: 'Dados inválidos' });
});

app.get('/texto', (req, res) => {
  res.send('Resposta em texto simples');
});

app.use((req, res) => {

  res.status(404).json({

    erro: 'Rota não encontrada',

    metodo: req.method,

    caminho: req.url,

  });

});

app.listen(PORTA, () => console.log(`Porta ${PORTA}`));

// Inicialização do servidor (ao final do arquivo)
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});



// const express = require("express");
// const app = express();
// const PORTA = 3000;

// // Base de dados simulada
// const tarefas = [
//   { id: 1, texto: "Estudar Express", coluna: "afazer", prioridade: "alta" },
//   { id: 2, texto: "Criar rotas GET", coluna: "em_andamento", prioridade: "media" },
//   { id: 3, texto: "Testar no Postman", coluna: "afazer", prioridade: "alta" }
// ];

// const usuarios = [
//   { id: 1, nome: "admin", email: "admin@taskflow.com" },
//   { id: 2, nome: "desenvolvedor", email: "dev@taskflow.com" }
// ];

// // ROTA 1 — Status da API
// app.get("/", (req, res) => {
//   res.json({ api: "TaskFlow", versao: "1.0", status: "online" });
// });

// // ROTA 2, ROTA 4 e DESAFIO — Listar tarefas e aplicar filtros (?coluna=... &prioridade=...)
// app.get("/tarefas", (req, res) => {
//   const { coluna, prioridade } = req.query;
//   let resultado = tarefas;

//   if (coluna) {
//     resultado = resultado.filter((t) => t.coluna === coluna);
//   }
//   if (prioridade) {
//     resultado = resultado.filter((t) => t.prioridade === prioridade);
//   }

//   res.json(resultado);
// });

// // ROTA 3 — Buscar tarefa por ID
// app.get("/tarefas/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const tarefa = tarefas.find((t) => t.id === id);

//   if (!tarefa) {
//     return res.status(404).json({ erro: "Tarefa não encontrada" });
//   }

//   res.json(tarefa);
// });

// // ROTA 5 — Listar usuários
// app.get("/usuarios", (req, res) => {
//   res.json(usuarios);
// });

// // ROTA 6 — 404 Genérico (Deve ser declarado após todas as outras rotas)
// app.use((req, res) => {
//   res.status(404).json({ erro: "Rota não encontrada" });
// });

// app.listen(PORTA, () => {
//   console.log(`Servidor rodando em http://localhost:${PORTA}`);
// });