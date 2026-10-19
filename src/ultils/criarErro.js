function criarErro(status, mensagem, detalhes = null) {
  const erro = new Error(mensagem);
  erro.status = status;
  if (detalhes) {
    erro.detalhes = detalhes;
  }
  return erro;
}

module.exports = criarErro;