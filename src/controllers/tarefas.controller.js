
const tarefasModel = require("../models/tarefa.model");
const criarErro = require("../ultils/criarErro");
const prisma = require("../database/db");

const prioridadesValidas = ["baixa", "media", "alta"];
const colunasValidas = ["afazer", "andamento", "concluido"];
const LIMITE_ANDAMENTO = 5;

// Obtém o model de usuários
const getUsuariosModel = () => prisma.usuario || prisma.usuarios;

// Converte o nome da prioridade para o ID correspondente
function obterIdPrioridade(valor) {
  if (valor !== undefined && valor !== null && valor !== "") {
    const numero = Number(valor);

    if (Number.isInteger(numero) && numero > 0) {
      return numero;
    }
  }

  const nome = String(valor || "media")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const prioridades = {
    baixa: 1,
    media: 2,
    alta: 3,
  };

  return prioridades[nome] || null;
}

const tarefasController = {
  async listar(req, res, next) {
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
    } catch (erro) {
      next(erro);
    }
  },

  async estatisticas(req, res, next) {
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
    } catch (erro) {
      next(erro);
    }
  },

  async resumo(req, res, next) {
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
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const tarefa = await tarefasModel.buscar(id);

      if (!tarefa) {
        throw criarErro(404, "Tarefa não encontrada");
      }

      res.json(tarefa);
    } catch (erro) {
      next(erro);
    }
  },

  // CRIAR TAREFA
  async criar(req, res, next) {
    try {
      const textoInput =
        req.body.texto ||
        req.body.titulo ||
        req.body.tarefa;

      const {
        prioridade = "media",
        coluna = "afazer",
        projetoId,
        projeto_id,
      } = req.body;

      if (!textoInput || !textoInput.trim()) {
        throw criarErro(400, "Texto/Título da tarefa é obrigatório");
      }

      if (!colunasValidas.includes(coluna)) {
        throw criarErro(400, "Coluna inválida");
      }

      // Recebe o ID da prioridade enviado pelo frontend
      const prioridadeRecebida =
        req.body.prioridadeId ??
        req.body.prioridade_id ??
        req.body.idprioridade ??
        req.body.id_prioridade;

      const parsedPrioridadeId =
        obterIdPrioridade(prioridadeRecebida ?? prioridade);

      if (
        !parsedPrioridadeId ||
        !prioridadesValidas.includes(
          String(prioridadeRecebida ?? prioridade)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        ) &&
        prioridadeRecebida == null &&
        ![1, 2, 3].includes(parsedPrioridadeId)
      ) {
        throw criarErro(400, "Selecione uma prioridade válida");
      }

      // Identifica o responsável
      const usuarioIdRaw =
        req.usuario?.id ||
        req.body.usuarioId ||
        req.body.usuario_id ||
        req.body.usuario ||
        req.body.responsavelId;

      let parsedUsuarioId = Number(usuarioIdRaw);

      if (!usuarioIdRaw || !Number.isInteger(parsedUsuarioId) || parsedUsuarioId <= 0) {
        const primeiroUsuario = await getUsuariosModel().findFirst({
          orderBy: { id: "asc" },
        });

        if (primeiroUsuario) {
          parsedUsuarioId = primeiroUsuario.id;
        } else {
          throw criarErro(400, "Um dos ids informados não existe");
        }
      }

      // Verifica limite de tarefas em andamento
      if (coluna === "andamento") {
        const andamento = await tarefasModel.listarPorColuna("andamento");

        if (andamento.length >= LIMITE_ANDAMENTO) {
          throw criarErro(
            409,
            `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`
          );
        }
      }

      // Projeto
      const rawProj = projetoId ?? projeto_id;

      const parsedProjetoId =
        rawProj && !isNaN(Number(rawProj))
          ? Number(rawProj)
          : null;

      // Cria a tarefa com o ID correto da prioridade
      const novaTarefa = await tarefasModel.adicionar({
        texto: textoInput.trim(),
        prioridade,
        prioridadeId: parsedPrioridadeId,
        coluna,
        usuarioId: parsedUsuarioId,
        projetoId: parsedProjetoId,
        dataConclusao:
          coluna === "concluido"
            ? new Date().toISOString()
            : null,
      });

      return res.status(201).json(novaTarefa);

    } catch (erro) {
      if (
        erro.statusCode === 400 ||
        erro.code === "P2003" ||
        erro.message === "Um dos ids informados não existe"
      ) {
        return res.status(400).json({
          erro: erro.message,
        });
      }

      next(erro);
    }
  },

  // ATUALIZAR TAREFA
  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const tarefa = await tarefasModel.buscar(id);

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      const {
        texto,
        coluna,
        usuarioId,
        usuario_id,
        projetoId,
        projeto_id,
      } = req.body;

      if (coluna && !colunasValidas.includes(coluna)) {
        throw criarErro(400, "Coluna inválida");
      }

      // Verifica limite de tarefas em andamento
      if (coluna === "andamento" && tarefa.coluna !== "andamento") {
        const andamento = await tarefasModel.listarPorColuna("andamento");

        if (andamento.length >= LIMITE_ANDAMENTO) {
          throw criarErro(
            409,
            `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`
          );
        }
      }

      const dadosAtualizados = {
        texto: texto ?? tarefa.texto,
        coluna: coluna ?? tarefa.coluna,
      };

      // Atualiza usuário
      const rawUser = usuarioId ?? usuario_id;

      if (
        rawUser !== undefined &&
        rawUser !== null &&
        !isNaN(Number(rawUser)) &&
        Number(rawUser) > 0
      ) {
        dadosAtualizados.usuarioId = Number(rawUser);
      }

      // Atualiza prioridade
      const rawPrio =
        req.body.prioridadeId ??
        req.body.prioridade_id ??
        req.body.idprioridade ??
        req.body.id_prioridade;

      if (rawPrio !== undefined && rawPrio !== null && rawPrio !== "") {
        const prioridadeId = obterIdPrioridade(rawPrio);

        if (!prioridadeId) {
          throw criarErro(400, "Prioridade inválida");
        }

        dadosAtualizados.prioridadeId = prioridadeId;
      } else if (req.body.prioridade !== undefined) {
        // Compatibilidade com requisições que enviam apenas o nome
        const prioridadeId = obterIdPrioridade(req.body.prioridade);

        if (!prioridadeId) {
          throw criarErro(400, "Prioridade inválida");
        }

        dadosAtualizados.prioridadeId = prioridadeId;
      }

      // Atualiza projeto
      const rawProj = projetoId ?? projeto_id;

      if (rawProj !== undefined) {
        dadosAtualizados.projetoId =
          rawProj && !isNaN(Number(rawProj)) && Number(rawProj) > 0
            ? Number(rawProj)
            : null;
      }

      // Datas de início e conclusão
      if (coluna === "concluido" && tarefa.coluna !== "concluido") {
        dadosAtualizados.dataConclusao = new Date().toISOString();
      }

      if (coluna && coluna !== "concluido" && tarefa.coluna === "concluido") {
        dadosAtualizados.dataConclusao = null;
      }

      const atualizada = await tarefasModel.atualizar(
        id,
        dadosAtualizados
      );

      return res.json(atualizada);

    } catch (erro) {
      if (
        erro.statusCode === 400 ||
        erro.code === "P2003" ||
        erro.message === "Um dos ids informados não existe"
      ) {
        return res.status(400).json({
          erro: erro.message,
        });
      }

      if (
        erro.statusCode === 404 ||
        erro.message === "Tarefa não encontrada"
      ) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      next(erro);
    }
  },

  async remover(req, res, next) {
    try {
      const id = Number(req.params.id);
      const removida = await tarefasModel.remover(id);

      if (!removida) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      return res.status(200).json(removida);
    } catch (erro) {
      if (
        erro.statusCode === 404 ||
        erro.message === "Tarefa não encontrada"
      ) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      next(erro);
    }
  },

  async rankingPorUsuario(req, res, next) {
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
    } catch (erro) {
      next(erro);
    }
  },
};

module.exports = tarefasController;
