require("dotenv").config();

const express = require("express");
const cors = require("cors");

// 1. Instância Singleton do Prisma para Serverless
const prisma = require("./src/lib/prisma"); 

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
// SWAGGER (Ajustado para CDN Vercel)
// ===============================
const swaggerUI = require("swagger-ui-express");
const openapi = require("./src/docs/openapi");

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const JS_BUNDLE = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js";
const JS_PRESET = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js";

app.use("/docs", swaggerUI.serve, swaggerUI.setup(openapi, {
  customCssUrl: CSS_URL,
  customJs: [JS_BUNDLE, JS_PRESET]
}));

// ===============================
// MIDDLEWARES DE REQUISIÇÃO
// ===============================

const corsOptions = {
  origin: [
    "https://task-flow-frontend-teal.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200
};

// 1. Aplica CORS globalmente
app.use(cors(corsOptions));

app.use(express.json());
app.use(logger);

// 2. Valida Content-Type apenas para métodos com corpo
app.use((req, res, next) => {
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

app.use((req, res, next) => {
  const rota = `${req.method} ${req.url}`;
  next(criarErro(404, `Rota ${rota} não encontrada`));
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