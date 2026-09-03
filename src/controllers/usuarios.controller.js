// DADOS DOS USUÁRIOS
let usuarios = [
  { id: 1, nome: "admin", email: "admin@taskflow.com", senha: "1234" },
  { id: 2, nome: "lavi", email: "lavi@taskflow.com", senha: "5678" },
  { id: 3, nome: "tony", email: "tony@taskflow.com", senha: "1357" },
];

let proximoIdUsuario = 4;

const usuariosController = {
  //GET - LISTAR USUÁRIOS
  listar(req, res) {
    res.json(usuarios);
  },
  // GET - BUSCAR POR ID
  buscarPorId(req, res) {
    // req.params.id chega como STRING — converter para número
    const id = Number(req.params.id);
    // Buscar a tarefa no array
    const usuario = usuarios.find((t) => t.id === id);
    // Se não encontrou — retornar 404
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado!" });
    }
    res.json(usuario);
  },
  criar(req, res) {
    // req.body contém os dados enviados no body da requisição
    const { nome, email, senha } = req.body;

    // DESAFIO: não permitir dois usuários com o mesmo email
    const emailExistente = usuarios.find((usuario) => usuario.email === email);

    if (emailExistente) {
      return res.status(409).json({
        erro: "Email já cadastrado! Tente outro.",
      });
    }
    // Criar a nova tarefa com ID gerado pelo servidor
    const novoUsuario = {
      id: proximoIdUsuario++,
      nome: nome,
      email: email,
      senha: senha,
    };

    // Adicionar ao array em memória
    usuarios.push(novoUsuario);
    // Retornar a tarefa criada com status 201 Created
    res.status(201).json(novoUsuario);
  },
  // PUT - EDITAR USUARIOS
  atualizar(req, res) {
    const id = Number(req.params.id);
    const { nome, email, senha } = req.body;

    // Encontrar o índice da tarefa no array
    const indice = usuarios.findIndex((usuario) => usuario.id === id);
    // Se não encontrou — retornar 404
    if (indice === -1) {
      return res.status(404).json({ erro: "Usuario não encontrada" });
    }
    const emailExistente = usuarios.find(
      (usuario) => usuario.email === email && usuario.id !== id,
    );
    if (emailExistente) {
      return res.status(409).json({
        erro: "Este email já está cadastrado",
      });
    }
    // Substituir a tarefa no array mantendo o mesmo ID
    usuarios[indice] = { id, ...req.body };
    // Retornar a tarefa atualizada com status 200
    res.json(usuarios[indice]);
  },
  //DELETE - REMOVER USUÀRIO
  remover(req, res) {
    const id = Number(req.params.id);
    const usuario = usuarios.find((usuario) => usuario.id === id);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado!" });
    }
    usuarios = usuarios.filter((usuario) => usuario.id !== id);
    res.json({ mensagem: "Usuário removido com sucesso!", id });
  },
};
module.exports = usuariosController;