require("dotenv").config();

const express = require("express");
const cors = require("cors"); // 1. Módulo importado


const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContentType");
const tratarErros = require("./src/middlewares/erro.middleware");
const criarErro = require("./src/ultils/criarErro");

// const pool = require("./src/database/db");
const authRoutes = require("./src/routes/auth.routes");
const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const projetosRoutes = require("./src/routes/projetos.routes");
const prioridadesRoutes = require("./src/routes/prioridades.routes");

const app = express();
const PORTA = process.env.PORTA || 3001;

// ===============================
// MIDDLEWARES DE REQUISIÇÃO
// ===============================

// 2. ATIVAR O CORS PRIMEIRO (essencial para interceptar requisições OPTIONS do browser)
app.use(cors());
app.use(express.json());
app.use(logger);

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    return validarContentType(req, res, next);
  }
  next();
});

// ===============================
// 1. ROTAS (Sempre primeiro)
// ===============================

app.get("/", (req, res) => {
  res.json({
    api: "TaskFlow",
    versao: "1.0",
    status: "online"
  });
});

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/tarefas", tarefasRoutes);
app.use("/projetos", projetosRoutes);
app.use("/prioridades", prioridadesRoutes);

// ===============================
// 2. ROTA 404 (Se nenhuma rota acima respondeu)
// ===============================

app.use((req, res) => {
  const rota = `${req.method} ${req.url}`;
  throw criarErro(404, `Rota ${rota} não encontrada`);
});

// ===============================
// 3. TRATAMENTO DE ERROS (Sempre por último)
// ===============================

app.use(tratarErros);

// ===============================
// SERVIDOR
// ===============================

if (require.main === module) {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}

module.exports = app;