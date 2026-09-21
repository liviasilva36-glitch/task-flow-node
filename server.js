require("dotenv").config();

const express = require("express");
const cors = require("cors");

const logger = require("./src/middlewares/logger");
const validarContentType =
  require("./src/middlewares/validarContentType");

const authRoutes =
  require("./src/routes/auth.routes");

const tarefasRoutes =
  require("./src/routes/tarefas.routes");

const usuariosRoutes =
  require("./src/routes/usuarios.routes");

const projetosRoutes =
  require("./src/routes/projetos.routes");

const app = express();

const PORTA = process.env.PORTA || 3001;


// CORS

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      "http://localhost:5173",

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],

    maxAge: 86400
  })
);


// Middlewares

app.use(express.json());

app.use(logger);

app.use(validarContentType);


// Rotas

app.use("/auth", authRoutes);

app.use("/usuarios", usuariosRoutes);

app.use("/tarefas", tarefasRoutes);

app.use("/projetos", projetosRoutes);


// Página inicial

app.get("/", (req, res) => {

  res.json({
    api: "TaskFlow",
    versao: "1.0",
    status: "online"
  });

});


// 404

app.use((req, res) => {

  res.status(404).json({
    erro: "Rota não encontrada",
    metodo: req.method,
    caminho: req.url
  });

});


// Servidor

app.listen(PORTA, () => {

  console.log(
    `Servidor rodando em http://localhost:${PORTA}`
  );

});