require("dotenv").config();

const express = require("express");
const cors = require("cors");

const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContentType");
// 1. IMPORTAÇÃO DO MIDDLEWARE DE ERROS (Ajuste o caminho se o seu ficheiro tiver outro nome)
const tratarErros = require("./src/middlewares/erro.middleware");

const pool = require("./src/database/db");
const authRoutes = require("./src/routes/auth.routes");
const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const projetosRoutes = require("./src/routes/projetos.routes");

const app = express();

const PORTA = process.env.PORTA || 3001;

// ===============================
// CONEXÃO COM O BANCO DE DADOS
// ===============================

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    console.log("Hora/Data ao conectar:", res.rows[0].now);
  }
});


// ===============================
// CORS (CORRIGIDO)
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-flow-frontend-teal.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origem (como Thunder Client/Postman) ou origens permitidas
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Retorna false em vez de disparar uma exceção de servidor
        callback(null, false);
      }
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],
    credentials: true,
    maxAge: 86400
  })
);


// ===============================
// MIDDLEWARES
// ===============================

app.use(express.json());

app.use(logger);

// Aplica a validação de Content-Type apenas para requisições com corpo (POST, PUT, PATCH)
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    return validarContentType(req, res, next);
  }
  next();
});


// ===============================
// ROTAS
// ===============================

app.use("/auth", authRoutes);

app.use("/usuarios", usuariosRoutes);

app.use("/tarefas", tarefasRoutes);

app.use("/projetos", projetosRoutes);


// ===============================
// PÁGINA INICIAL
// ===============================

app.get("/", (req, res) => {
  res.json({
    api: "TaskFlow",
    versao: "1.0",
    status: "online"
  });
});


// ===============================
// ROTA 404 (NÃO ENCONTRADA)
// ===============================

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    metodo: req.method,
    caminho: req.url
  });
});


// ===============================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ===============================

// 2. REGISTO DO MIDDLEWARE DE ERROS (Sempre por último, a seguir a todas as rotas e ao 404)
app.use(tratarErros);


// ===============================
// SERVIDOR
// ===============================

if (require.main === module) {
  app.listen(PORTA, () => {
    console.log(
      `Servidor rodando em http://localhost:${PORTA}`
    );
  });
}


// ===============================
// EXPORTAÇÃO
// ===============================

module.exports = app;