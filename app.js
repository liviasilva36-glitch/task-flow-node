const express = require("express");
const app = express();
const PORTA = 3000;

// Importação das rotas
const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");

// Middleware global para leitura de JSON
app.use(express.json());

// Rota raiz
app.get("/", (req, res) => {
  res.json({ api: "TaskFlow", versao: "1.0", status: "online" });
});

// Registro das rotas modularizadas
app.use("/tarefas", tarefasRoutes);
app.use("/usuarios", usuariosRoutes);

// Rota genérica para capturar 404
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});