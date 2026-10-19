const criarErro = require("../ultils/criarErro");

function validar(schema, origem) {
  return function (req, res, next) {
    const dados = req[origem || "body"] || {};
    const erros = [];

    for (const campo in schema) {
      const regras = schema[campo];
      const valor = dados[campo];
      const ausente = valor === undefined || valor === null || valor === "";

      if (regras.obrigatorio && ausente) {
        erros.push(`O campo '${campo}' é obrigatório`);
        continue;
      }

      if (ausente) continue;

      if (regras.tipo === "inteiro") {
        const numero = typeof valor === "string" ? Number(valor) : valor;

        if (!Number.isInteger(numero) || numero <= 0) {
          erros.push(`O campo '${campo}' deve ser inteiro positivo`);
        }
      } else if (regras.tipo && typeof valor !== regras.tipo) {
        erros.push(`O campo '${campo}' deve ser do tipo ${regras.tipo}`);
      }
    } 

    if (erros.length > 0) {
      throw criarErro(400, "Dados inválidos", erros);
    }

    next();
  };
}

module.exports = validar;