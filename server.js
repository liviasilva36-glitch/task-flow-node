xrequire("dotenv").config();

const express = require("express");
const cors = require("cors");

// Importação padrão do Prisma Client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContentType");
const tratarErros = require("./src/middlewares/erro.middleware");
const criarErro = require("./src/ultils/criarErro");

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

const corsOptions = {
  origin: [
    "https://task-flow-frontend-teal.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// 1. Aplica CORS e responde a requisições de preflight (OPTIONS)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(logger);

// 2. Valida Content-Type apenas para requisições com corpo e ignora OPTIONS
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    return validarContentType(req, res, next);
  }
  next();
});

// ===============================
// ROTAS
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
// ROTA 404 E ERROS
// ===============================

app.use((req, res) => {
  const rota = `${req.method} ${req.url}`;
  throw criarErro(404, `Rota ${rota} não encontrada`);
});

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