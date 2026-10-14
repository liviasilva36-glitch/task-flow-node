const tarefasModel = require("../models/tarefa.model");

const prioridadesValidas = ["baixa", "media", "alta"];
const colunasValidas = ["afazer", "andamento", "concluido"];
const LIMITE_ANDAMENTO = 5;

const tarefasController = {
  async listar(req, res) {
    try {
      const { coluna, usuarioId, projetoId } = req.query;

      let resultado;
      if (coluna) {
        resultado = await tarefasModel.listarPorColuna(coluna);
      } else if (usuarioId) {
        resultado = await tarefasModel.listarPorUsuario(Number(usuarioId));
      } else if (projetoId) {
        resultado = await tarefasModel.listarPorProjeto(Number(projetoId));
      } else {
        resultado = await tarefasModel.listar();
      }

      res.json(resultado);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async estatisticas(req, res) {
    try {
      const { coluna } = req.query;

      const base = coluna
        ? await tarefasModel.listarPorColuna(coluna)
        : await tarefasModel.listar();

      const porColuna = {
        afazer: base.filter((t) => t.coluna === "afazer").length,
        andamento: base.filter((t) => t.coluna === "andamento").length,
        concluido: base.filter((t) => t.coluna === "concluido").length,
      };

      res.json({
        total: base.length,
        porColuna,
      });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async resumo(req, res) {
    try {
      const tarefas = await tarefasModel.listar();
      const total = tarefas.length;
      const concluido = tarefas.filter((t) => t.coluna === "concluido").length;
      const andamento = tarefas.filter((t) => t.coluna === "andamento").length;
      const afazer = tarefas.filter((t) => t.coluna === "afazer").length;

      res.json({
        total,
        concluido,
        andamento,
        afazer,
        mensagem: `Você tem ${total} tarefas. ${concluido} concluídas, ${andamento} em andamento e ${afazer} a fazer.`,
      });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      const tarefa = await tarefasModel.buscar(id);

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada, por favor verifique o ID informado",
        });
      }

      res.json(tarefa);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async criar(req, res) {
    try {
      const {
        texto,
        prioridade = "media",
        coluna = "afazer",
        projetoId,
      } = req.body;

      const usuarioId = req.usuario?.id || req.body.usuarioId;

      if (!texto || !texto.trim()) {
        return res.status(400).json({
          erro: "Texto obrigatório e não pode ser vazio, tenha certeza que digitou algo",
        });
      }

      if (!usuarioId) {
        return res.status(400).json({
          erro: "usuarioId é obrigatório, uma tarefa precisa estar associada a um usuário",
        });
      }

      if (!prioridadesValidas.includes(prioridade)) {
        return res.status(400).json({
          erro: "Prioridade inválida",
          valoresPermitidos: prioridadesValidas,
        });
      }

      if (!colunasValidas.includes(coluna)) {
        return res.status(400).json({
          erro: "Coluna inválida, tente novamente com uma das colunas válidas",
          valoresPermitidos: colunasValidas,
        });
      }

      if (coluna === "andamento") {
        const andamento = await tarefasModel.listarPorColuna("andamento");

        if (andamento.length >= LIMITE_ANDAMENTO) {
          return res.status(409).json({
            erro: `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`,
          });
        }
      }

      const novaTarefa = await tarefasModel.adicionar({
        texto: texto.trim(),
        prioridade,
        coluna,
        usuarioId: Number(usuarioId),
        projetoId: projetoId ? Number(projetoId) : null,
        dataConclusao:
          coluna === "concluido" ? new Date().toISOString() : null,
      });

      res.status(201).json(novaTarefa);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      const tarefa = await tarefasModel.buscar(id);

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      const { texto, prioridade, coluna, usuarioId, projetoId } = req.body;

      if (
        prioridade !== undefined &&
        !prioridadesValidas.includes(prioridade)
      ) {
        return res.status(400).json({
          erro: "Prioridade inválida",
          valoresPermitidos: prioridadesValidas,
        });
      }

      if (coluna !== undefined && !colunasValidas.includes(coluna)) {
        return res.status(400).json({
          erro: "Coluna inválida",
          valoresPermitidos: colunasValidas,
        });
      }

      if (coluna === "andamento" && tarefa.coluna !== "andamento") {
        const andamento = await tarefasModel.listarPorColuna("andamento");

        if (andamento.length >= LIMITE_ANDAMENTO) {
          return res.status(409).json({
            erro: `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`,
          });
        }
      }

      const dadosAtualizados = {
        texto: texto ?? tarefa.texto,
        prioridade: prioridade ?? tarefa.prioridade,
        coluna: coluna ?? tarefa.coluna,
        usuarioId:
          usuarioId !== undefined ? Number(usuarioId) : tarefa.usuarioId || tarefa.usuario_id,
        projetoId:
          projetoId !== undefined ? Number(projetoId) : tarefa.projetoId || tarefa.projeto_id,
      };

      if (coluna === "concluido" && tarefa.coluna !== "concluido") {
        dadosAtualizados.dataConclusao = new Date().toISOString();
      }

      if (coluna && coluna !== "concluido" && tarefa.coluna === "concluido") {
        dadosAtualizados.dataConclusao = null;
      }

      const atualizada = await tarefasModel.atualizar(id, dadosAtualizados);

      res.json(atualizada);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async remover(req, res) {
    try {
      const id = Number(req.params.id);
      const removida = await tarefasModel.remover(id);

      if (!removida) {
        return res.status(404).json({
          erro: "Tarefa não encontrada para remoção, verifique o ID informado",
        });
      }

      res.json({
        mensagem: "Tarefa removida com sucesso",
        tarefa: removida,
      });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async rankingPorUsuario(req, res) {
    try {
      const tarefas = await tarefasModel.listar();
      const ranking = {};

      tarefas.forEach((tarefa) => {
        const usuarioId = tarefa.usuarioId || tarefa.usuario_id;

        if (!ranking[usuarioId]) {
          ranking[usuarioId] = {
            usuarioId,
            total: 0,
            concluidas: 0,
          };
        }

        ranking[usuarioId].total++;

        if (tarefa.coluna === "concluido") {
          ranking[usuarioId].concluidas++;
        }
      });

      const resultado = Object.values(ranking).sort(
        (a, b) => b.concluidas - a.concluidas
      );

      res.json(resultado);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },
};

module.exports = tarefasController; 