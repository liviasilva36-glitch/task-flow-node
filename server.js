console.log('TaskFlow API - pronto para o Express!!!!!!');

const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('TaskFlow API rodando!!!!!!!');
});

app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});