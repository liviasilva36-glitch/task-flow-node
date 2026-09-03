let projetos = [
  { id: 1, nome: "Projeto Y", descricao: "descrição do projeto Y" },
  { id: 2, nome: "Projeto X", descricao: "descrição do projeto X" },
  { id: 3, nome: "Projeto Z", descricao: "descrição do projeto Z" },
];

let proximoProjeto = 4;

const projetosController = {
  // GET - MOSTRAR PROJETOS
  listarProjetos(req, res) {
    res.json(projetos);
  },
  // GET - BUSCAR POR ID
  buscarProjetosId(req, res) {
    const id = Number(req.params.id);
    const projeto = projetos.find((p) => p.id === id);
    if (!projeto) {
      return res.status(404).json({ erro: "Projeto não encontrada" });
    }
    // Se encontrou — retornar a tarefa
    res.json(projeto);
  },
  // POST - CRIAR NOVOS PROJETOS
  criarProjetos(req, res) {
    const { nome, descricao } = req.body;
    const novoProjeto = {
      id: proximoProjeto,
      nome,
      descricao,
    };
    projetos.push(novoProjeto);
    proximoProjeto++;

    res.status(201).json(novoProjeto);
  },
  // PUT - EDITAR PROJETOS
  atualizarProjetos(req, res) {
    const id = Number(req.params.id);
    const projeto = projetos.find((p) => p.id === id);

    if (!projeto) {
      return res.status(404).json({
        mensagem: "Projeto não encontrado",
      });
    }
    const { nome, descricao } = req.body;
    projeto.nome = nome ?? projeto.nome;
    projeto.descricao = descricao ?? projeto.descricao;

    res.json(projeto);
  },
  // DELETE - APAGAR PROJETOS
  removerProjetos(req, res) {
    const id = Number(req.params.id);
    const indice = projetos.findIndex((p) => p.id === id);

    if (indice === -1) {
      return res.status(404).json({
        mensagem: "Projeto não encontrado",
      });
    }
    const projetoRemovido = projetos.splice(indice, 1);
    res.json({
      mensagem: "Projeto removido com sucesso",
      projeto: projetoRemovido[0],
    });
  },
};
module.exports = projetosController;