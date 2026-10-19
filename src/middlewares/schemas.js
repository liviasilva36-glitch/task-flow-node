const schemas = {
  id: {
    id: {
      tipo: "inteiro",
      obrigatorio: true
    }
  },
  tarefa: {
    texto: {
      tipo: "string",
      obrigatorio: true
    },
    usuarioId: {
      tipo: "inteiro",
      obrigatorio: true
    }
  }
};

module.exports = schemas;