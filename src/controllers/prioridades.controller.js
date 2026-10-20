const prioridadeModel = require("../models/prioridades.model");

const prioridadesController = {
  listar: async (req, res) => {
    try {
      const prioridades = await prioridadeModel.listar();
      return res.status(200).json(prioridades);
    } catch (error) {
      return res.status(500).json({
        erro: {
          mensagem: "Erro ao buscar prioridades",
          detalhe: error.message
        }
      });
    }
  }
};

module.exports = prioridadesController;