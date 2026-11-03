const express = require('express');
const swaggerUI = require('swagger-ui-express');

// Importações dos seus arquivos
const swaggerDocument = require('./docs/openapi'); // Ajuste o caminho se necessário
const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');
const authRoutes = require('./routes/auth.routes');
const corsMiddleware = require('./middlewares/cors');

const app = express();

// 1. Aplica o CORS antes de qualquer rota ou parser
app.use(corsMiddleware);

// 2. Parser JSON
app.use(express.json());

// 3. Documentação Swagger (com CDN para não quebrar estilos na Vercel)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const JS_BUNDLE = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js";
const JS_PRESET = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js";

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument, {
  customCssUrl: CSS_URL,
  customJs: [JS_BUNDLE, JS_PRESET]
}));

// 4. Rota para a raiz do servidor
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow rodando com sucesso!' });
});

// 5. Registro dos módulos de rotas
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);
app.use('/auth', authRoutes);

// 6. Rota genérica para URLs não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// 7. Execução condicional do app.listen (Apenas Local)
const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// 8. Exportação obrigatória para a Vercel transformar em Serverless Function
module.exports = app;