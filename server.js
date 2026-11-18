const app = require('./src/app');
const prisma = require('./src/database/db');
const PORTA = process.env.PORTA || process.env.PORT || 3001;

if (require.main === module) {
  prisma.$connect()
    .then(() => console.log('Banco conectado'))
    .catch((err) => console.error('Erro ao conectar:', err.message));

  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}

module.exports = app;