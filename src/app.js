const express = require('express');

const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');
const corsMiddleware = require('./middlewares/cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

// 1. Aplica o CORS antes de qualquer rota ou parser
app.use(corsMiddleware);

// 2. Parser JSON
app.use(express.json());

// 3. Rota para a raiz do servidor
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow rodando com sucesso!' });
});

// 4. Registro dos módulos de rotas
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);
app.use('/auth', authRoutes);

// 5. Rota genérica para URLs não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});