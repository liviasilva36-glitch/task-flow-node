require("dotenv").config();

const express = require("express");
const cors = require("cors");

const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContentType");
const pool = require("./src/database/db");
const authRoutes = require("./src/routes/auth.routes");
const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const projetosRoutes = require("./src/routes/projetos.routes");

const app = express();

const PORTA = process.env.PORTA || 3001;

// ===============================

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
     console.log("Hora/Data ao conectar:", res.rows[0].now);
  }
});


// CORS
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-flow-frontend-teal.vercel.app"
];

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'https://localhost:5173',
     
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

app.use(validarContentType);


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
// ROTA 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    metodo: req.method,
    caminho: req.url
  });
});


// ===============================
// SERVIDOR
// ===============================

// Executa o servidor somente quando
// rodarmos o arquivo diretamente.
// No Vercel, o app será exportado.
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