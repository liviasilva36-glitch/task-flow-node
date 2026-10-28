const { Prisma } = require('@prisma/client');
const traduzirErroPrisma = require('../ultils/traduzirErroPrisma');

function tratarErros(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    err = traduzirErroPrisma (err, req.method) 
   }
  // Imprime o erro completo no terminal para identificarmos a falha
  console.error("ERRO CAPTURADO:", err);

  const status = err.status || 500;
  const mensagem = err.message || "Erro interno do servidor";
  const detalhes = err.detalhes || null;

  res.status(status).json({
    erro: {
      mensagem,
      ...(detalhes && { detalhes })
    }
  });
}

module.exports = tratarErros;