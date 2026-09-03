const express = require('express');

// Como já estamos em src/, apontamos direto para ./routes/
const tarefasRoutes = require('./routes/tarefas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
app.use(express.json());

// Registro dos módulos de rotas
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);

// Rota genérica para URLs não encontradas (Retorna 404)
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});