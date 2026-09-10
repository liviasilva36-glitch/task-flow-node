// function validar(schema) {        
//   return function(req, res, next) { 
//     const erros = [];              
//     const body = req.body || {};

//     for (const campo in schema) {
//         const regras = schema [campo];
//         const valor = body[campo];
//         const ausente = valor === undefined || valor === null || valor === '';
//     }
//     if (regras.obrigatorio && ausente) {
//         erros.push(`O campo '${campo}' é obrigatório`);
//         continue;}

// function validar(schema) {
//   return function(req, res, next) {
//     const erros = [];

//     for (const campo in schema) {
//       const regras  = schema[campo];
//       const valor   = req.body[campo];
//       const ausente = valor === undefined || valor === null || valor === '';

//       // 1 — Campo obrigatório ausente
//       if (regras.obrigatorio && ausente) {
//         erros.push(`O campo '${campo}' é obrigatório`);
//         continue; // não testar as demais regras
//       };
//     }

//       if (!ausente && regras.tipo && typeof valor !== regras.tipo) {
//         erros.push(
//           `O campo '${campo}' deve ser do tipo ${regras.tipo}`
//         );
//       }
    
//     if (erros.length > 0)
//       return res.status(400).json({ erros });
//     next();

//     if (regras.minLength && valor.length < regras.minLength)
//   erros.push(
//     `O campo '${campo}' deve ter ao menos ${regras.minLength} caracteres`
//   );

// // 6 — Tamanho máximo de texto
// if (regras.maxLength && valor.length > regras.maxLength)
//   erros.push(
//     `O campo '${campo}' deve ter no máximo ${regras.maxLength} caracteres`
//   );
//   }}

// module.exports = validar;

function validar(schema) {
  return function(req, res, next) {
    const erros = [];
    const body = req.body || {};

    for (const campo in schema) {
      const regras  = schema[campo];
      const valor   = body[campo];
      const ausente = valor === undefined || valor === null || valor === '';

      // 1 — Campo obrigatório ausente
      if (regras.obrigatorio && ausente) {
        erros.push(`O campo '${campo}' é obrigatório`);
        continue;
      }

      // Validações para campos preenchidos
      if (!ausente) {
        // 2 — Tipo do dado
        if (regras.tipo && typeof valor !== regras.tipo) {
          erros.push(`O campo '${campo}' deve ser do tipo ${regras.tipo}`);
        }

        // 3 — Tamanho mínimo de texto
        if (regras.minLength && typeof valor === 'string' && valor.length < regras.minLength) {
          erros.push(`O campo '${campo}' deve ter ao menos ${regras.minLength} caracteres`);
        }

        // 4 — Tamanho máximo de texto
        if (regras.maxLength && typeof valor === 'string' && valor.length > regras.maxLength) {
          erros.push(`O campo '${campo}' deve ter no máximo ${regras.maxLength} caracteres`);
        }

        // 5 — Valores permitidos (enum)
        if (regras.enum && Array.isArray(regras.enum) && !regras.enum.includes(valor)) {
          erros.push(`O campo '${campo}' deve ser um dos valores: ${regras.enum.join(', ')}`);
        }
      }
    }

    if (erros.length > 0) {
      return res.status(400).json({ erros });
    }

    return next();
  };
}

module.exports = validar;