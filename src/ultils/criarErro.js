function criarErro(statusCode, mensagem, detalhes) {
  const erro = new Error(mensagem);
  erro.status = statusCode;
  erro.statusCode = statusCode;
  if (detalhes) {
    erro.detalhes = detalhes;
  }
  return erro;
}

module.exports = criarErro;