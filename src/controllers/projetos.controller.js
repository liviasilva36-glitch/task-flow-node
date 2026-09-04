const tarefasModel = require("../models/tarefa.model");
let projetos = [
  {
    id: 1,
    nome: "Projeto Y",
    descricao: "Descrição do projeto Y",
  }, {
    id: 2,
    nome: "Projeto X",
    descricao: "Descrição do projeto X",
  }, {
    id: 3,
    nome: "Projeto Z",
    descricao: "Descrição do projeto Z",
  },
];

let proximoProjeto = 4;
const projetosController = {

  listarProjetos(req, res) {
    res.json(projetos);
  },






  buscarProjetosId(req, res) {
    const id = Number(req.params.id);
    const projeto = projetos.find(
      (p) => p.id === id
    );

    if (!projeto) {
      return res.status(404).json({
        erro: "Projeto não encontrado",
      });
    }

    res.json(projeto);
  },






  criarProjetos(req, res) {
    const { nome, descricao } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do projeto é obrigatório",
      });
    }

    const novoProjeto = {
      id: proximoProjeto++,
      nome: nome.trim(),
      descricao: descricao || "",
    };

    projetos.push(novoProjeto);

    res.status(201).json(novoProjeto);
  },





  atualizarProjetos(req, res) {
    const id = Number(req.params.id);

    const projeto = projetos.find(
      (p) => p.id === id
    );

    if (!projeto) {
      return res.status(404).json({
        erro: "Projeto não encontrado",
      });
    }

    const { nome, descricao } = req.body;

    if (nome !== undefined) {
      if (!nome.trim()) {
        return res.status(400).json({
          erro: "O nome do projeto não pode ficar vazio",
        });
      }

      projeto.nome = nome.trim();
    }

    if (descricao !== undefined) {
      projeto.descricao = descricao;
    }

    res.json(projeto);
  },





  removerProjetos(req, res) {
    const id = Number(req.params.id);

    const indice = projetos.findIndex(
      (p) => p.id === id
    );

    if (indice === -1) {
      return res.status(404).json({
        erro: "Projeto não encontrado",
      });
    }

    const tarefasDoProjeto =
      tarefasModel.listarPorProjeto(id);

    if (tarefasDoProjeto.length > 0) {
      return res.status(409).json({
        erro:
          "Não é possível remover o projeto porque ele possui tarefas.",
        quantidadeTarefas:
          tarefasDoProjeto.length,
      });
    }

    const projetoRemovido =
      projetos.splice(indice, 1);

    res.json({
      mensagem: "Projeto removido com sucesso",
      projeto: projetoRemovido[0],
    });
  },






  resumoProjeto(req, res) {
    const id = Number(req.params.id);


    const projeto = projetos.find(
      (p) => p.id === id
    );
    if (!projeto) {
      return res.status(404).json({
        erro: "Projeto não encontrado",
      });
    }

    const tarefas =
      tarefasModel.listarPorProjeto(id);

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
  },
};

module.exports = projetosController;