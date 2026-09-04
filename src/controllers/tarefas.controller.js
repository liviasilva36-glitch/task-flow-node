const tarefasModel = require("../models/tarefa.model");
const prioridadesValidas = ["baixa", "media", "alta"];
const colunasValidas = [
  "afazer",
  "andamento",
  "concluido",
];

const LIMITE_ANDAMENTO = 5;
const tarefasController = {

  listar(req, res) {
    const { coluna, usuarioId, projetoId } = req.query;
    let resultado = tarefasModel.listar();

    if (coluna) {
      resultado = resultado.filter(
        (tarefa) => tarefa.coluna === coluna
      );
    }

    if (usuarioId) {
      resultado = resultado.filter(
        (tarefa) =>
          tarefa.usuarioId === Number(usuarioId)
      );
    }

    if (projetoId) {
      resultado = resultado.filter(
        (tarefa) =>
          tarefa.projetoId === Number(projetoId)
      );
    }

    res.json(resultado);
  },

  estatisticas(req, res) {
    const { coluna } = req.query;

    const base = coluna
      ? tarefasModel.listarPorColuna(coluna)
      : tarefasModel.listar();

    const porColuna = {
      afazer: base.filter(
        (t) => t.coluna === "afazer"
      ).length,

      andamento: base.filter(
        (t) => t.coluna === "andamento"
      ).length,

      concluido: base.filter(
        (t) => t.coluna === "concluido"
      ).length,
    };

    res.json({
      total: base.length,
      porColuna,
    });
  },

  resumo(req, res) {
    const tarefas = tarefasModel.listar();
    const total = tarefas.length;
    const concluido = tarefas.filter(
      (t) => t.coluna === "concluido"
    ).length;

    const andamento = tarefas.filter(
      (t) => t.coluna === "andamento"
    ).length;

    const afazer = tarefas.filter(
      (t) => t.coluna === "afazer"
    ).length;

    res.json({
      total,
      concluido,
      andamento,
      afazer,
      mensagem: `Você tem ${total} tarefas. ${concluido} concluídas, ${andamento} em andamento e ${afazer} a fazer.`,
    });
  },

  buscarPorId(req, res) {
    const id = Number(req.params.id);
    const tarefa = tarefasModel.buscar(id);

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada,por favor verifique o ID informado",
      });
    }

    res.json(tarefa);
  },

  criar(req, res) {
    const {
      texto,
      prioridade = "media",
      coluna = "afazer",
      usuarioId,
      projetoId,
    } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({
        erro: "Texto obrigatório e não pode ser vazio , tenha certeza que digitou algo",
      });
    }

    if (!usuarioId) {
      return res.status(400).json({
        erro: "usuarioId é obrigatório, uma tarefa precisa esta associada a um usuário",
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
      const andamento = tarefasModel.listarPorColuna(
        "andamento"
      );

      if (andamento.length >= LIMITE_ANDAMENTO) {
        return res.status(409).json({
          erro: `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`,
        });
      }
    }

    const novaTarefa = tarefasModel.adicionar({
      texto: texto.trim(),
      prioridade,
      coluna,
      usuarioId: Number(usuarioId),
      projetoId: projetoId
        ? Number(projetoId)
        : null,
      dataConclusao:
        coluna === "concluido"
          ? new Date().toISOString()
          : null,
    });

    res.status(201).json(novaTarefa);
  },

  atualizar(req, res) {
    const id = Number(req.params.id);

    const tarefa = tarefasModel.buscar(id);

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada",
      });
    }

    const {
      texto,
      prioridade,
      coluna,
      usuarioId,
      projetoId,
    } = req.body;

    // VALIDAR PRIORIDADE
    if (
      prioridade !== undefined &&
      !prioridadesValidas.includes(prioridade)
    ) {
      return res.status(400).json({
        erro: "Prioridade inválida",
        valoresPermitidos: prioridadesValidas,
      });
    }

    if (
      coluna !== undefined &&
      !colunasValidas.includes(coluna)
    ) {
      return res.status(400).json({
        erro: "Coluna inválida",
        valoresPermitidos: colunasValidas,
      });
    }

    if (
      coluna === "andamento" &&
      tarefa.coluna !== "andamento"
    ) {
      const andamento =
        tarefasModel.listarPorColuna("andamento");

      if (andamento.length >= LIMITE_ANDAMENTO) {
        return res.status(409).json({
          erro: `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`,
        });
      }
    }

    const dadosAtualizados = {
      texto: texto ?? tarefa.texto,
      prioridade:
        prioridade ?? tarefa.prioridade,
      coluna: coluna ?? tarefa.coluna,
      usuarioId:
        usuarioId !== undefined
          ? Number(usuarioId)
          : tarefa.usuarioId,
      projetoId:
        projetoId !== undefined
          ? Number(projetoId)
          : tarefa.projetoId,
    };

    if (
      coluna === "concluido" &&
      tarefa.coluna !== "concluido"
    ) {
      dadosAtualizados.dataConclusao =
        new Date().toISOString();
    }

    if (
      coluna &&
      coluna !== "concluido" &&
      tarefa.coluna === "concluido"
    ) {
      dadosAtualizados.dataConclusao = null;
    }

    const atualizada = tarefasModel.atualizar(
      id,
      dadosAtualizados
    );

    res.json(atualizada);
  },

  remover(req, res) {
    const id = Number(req.params.id);

    const removida = tarefasModel.remover(id);

    if (!removida) {
      return res.status(404).json({
        erro: "Tarefa não encontrada para remoçao, verifique o Id informado",
      });
    }

    res.json({
      mensagem: "Tarefa removida com sucesso",
      tarefa: removida,
    });
  },

  rankingPorUsuario(req, res) {
    const tarefas = tarefasModel.listar();

    const ranking = {};

    tarefas.forEach((tarefa) => {
      const usuarioId = tarefa.usuarioId;

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

    const resultado = Object.values(ranking)
      .sort(
        (a, b) => b.concluidas - a.concluidas
      );

    res.json(resultado);
  },
};

module.exports = tarefasController;