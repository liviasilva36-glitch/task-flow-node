function tratarErros(err, req, res, next) {
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