const express = require('express');

const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const projetosRoutes = require('./routes/projetos.routes');

const app = express();
app.use(express.json());

// 🟢 ADICIONE ESTA ROTA PARA A RAIZ DO SERVIDOR:
app.get('/', (req, res) => {
  res.json({ mensagem: 'API TaskFlow rodando com sucesso!' });
});

// Registro dos módulos de rotas
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/projetos', projetosRoutes);

// Rota genérica para URLs não encontradas (Retorna 404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});