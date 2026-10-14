const projetoModel = require("../models/projeto.model");
const tarefasModel = require("../models/tarefa.model");

const projetosController = {
  async listarProjetos(req, res) {
    try {
      const projetos = await projetoModel.listar();
      res.json(projetos);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async buscarProjetosId(req, res) {
    try {
      const id = Number(req.params.id);
      const projeto = await projetoModel.buscarPorId(id);

      if (!projeto) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      res.json(projeto);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async criarProjetos(req, res) {
    try {
      const { nome, descricao } = req.body;

      if (!nome || !nome.trim()) {
        return res.status(400).json({
          erro: "O nome do projeto é obrigatório, e não pode ficar vazio",
        });
      }

      const novoProjeto = await projetoModel.criar({
        nome: nome.trim(),
        descricao: descricao || "",
      });

      res.status(201).json(novoProjeto);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async atualizarProjetos(req, res) {
    try {
      const id = Number(req.params.id);
      const projetoExistente = await projetoModel.buscarPorId(id);

      if (!projetoExistente) {
        return res.status(404).json({
          erro: "Projeto não encontrado, busque outro id ou crie um novo projeto",
        });
      }

      const { nome, descricao } = req.body;

      if (nome !== undefined && !nome.trim()) {
        return res.status(400).json({
          erro: "O nome do projeto não pode ficar vazio",
        });
      }

      const projetoAtualizado = await projetoModel.atualizar(id, {
        nome: nome !== undefined ? nome.trim() : projetoExistente.nome,
        descricao: descricao !== undefined ? descricao : projetoExistente.descricao,
      });

      res.json(projetoAtualizado);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async removerProjetos(req, res) {
    try {
      const id = Number(req.params.id);
      const projetoExistente = await projetoModel.buscarPorId(id);

      if (!projetoExistente) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      const tarefasDoProjeto = await tarefasModel.listarPorProjeto(id);

      if (tarefasDoProjeto.length > 0) {
        return res.status(409).json({
          erro: "Não é possível remover o projeto porque ele possui tarefas.",
          quantidadeTarefas: tarefasDoProjeto.length,
        });
      }

      const projetoRemovido = await projetoModel.remover(id);

      res.json({
        mensagem: "Projeto removido com sucesso",
        projeto: projetoRemovido,
      });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async resumoProjeto(req, res) {
    try {
      const id = Number(req.params.id);
      const projeto = await projetoModel.buscarPorId(id);

      if (!projeto) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      const tarefas = await tarefasModel.listarPorProjeto(id);

      const afazer = tarefas.filter(
        (tarefa) => tarefa.coluna === "afazer"
      ).length;

      const andamento = tarefas.filter(
        (tarefa) => tarefa.coluna === "andamento"
      ).length;

      const concluido = tarefas.filter(
        (tarefa) => tarefa.coluna === "concluido"
      ).length;

      res.json({
        projeto: {
          id: projeto.id,
          nome: projeto.nome,
          descricao: projeto.descricao,
        },
        tarefas: {
          total: tarefas.length,
          afazer,
          andamento,
          concluido,
        },
      });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },
};

module.exports = projetosController;