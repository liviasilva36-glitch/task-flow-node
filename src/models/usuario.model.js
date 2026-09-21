let usuarios = [
  {
    id: 1,
    nome: "admin",
    email: "admin@taskflow.com",
    senha: "1234",
  },
  {
    id: 2,
    nome: "leskinha",
    email: "leskinha@taskflow.com",
    senha: "5678",
  },
  {
    id: 3,
    nome: "alan",
    email: "alan@taskflow.com",
    senha: "1357",
  },
];

let proximoId = 4;

const usuarioModel = {

  listar() {
    return usuarios;
  },

  buscarPorId(id) {
    return usuarios.find(
      (usuario) => usuario.id === id
    );
  },

  buscarPorEmail(email) {
    return usuarios.find(
      (usuario) => usuario.email === email
    );
  },

  autenticar(email, senha) {
    return usuarios.find(
      (usuario) =>
        usuario.email === email &&
        usuario.senha === senha
    );
  },

  criar(nome, email, senha) {

    const novoUsuario = {
      id: proximoId++,
      nome,
      email,
      senha,
    };

    usuarios.push(novoUsuario);

    return novoUsuario;
  },

  atualizar(id, dados) {

    const indice = usuarios.findIndex(
      (usuario) => usuario.id === id
    );

    if (indice === -1) {
      return null;
    }

    usuarios[indice] = {
      ...usuarios[indice],
      ...dados,
      id,
    };

    return usuarios[indice];
  },

  remover(id) {

    const usuario = this.buscarPorId(id);

    if (!usuario) {
      return null;
    }

    usuarios = usuarios.filter(
      (usuario) => usuario.id !== id
    );

    return usuario;
  },
};

module.exports = usuarioModel;