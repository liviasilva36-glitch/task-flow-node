let tarefas = [
  {
    id: 1,
    texto: "Estudar Node.js",
    prioridade: "alta",
    coluna: "andamento",
    usuarioId: 1,
    projetoId: 1,
    dataConclusao: null,
  },{
    id: 2,
    texto: "Fazer exercícios",
    prioridade: "media",
    coluna: "afazer",
    usuarioId: 2,
    projetoId: 1,
    dataConclusao: null,
  },
];

let proximoId = 3;

function listar() {
  return tarefas;
}

function buscar(id) {
  return tarefas.find((tarefa) => tarefa.id === id);
}
function listarPorColuna(coluna) {
  return tarefas.filter((tarefa) => tarefa.coluna === coluna);
}
function listarPorUsuario(usuarioId) {
  return tarefas.filter(
    (tarefa) => tarefa.usuarioId === usuarioId
  );
}

function listarPorProjeto(projetoId) {
  return tarefas.filter(
    (tarefa) => tarefa.projetoId === projetoId
  );
}

function adicionar(dados) {
  const novaTarefa = {
    id: proximoId++,
    ...dados,
  };

  tarefas.push(novaTarefa);

  return novaTarefa;
}

function atualizar(id, dados) {
  const indice = tarefas.findIndex(
    (tarefa) => tarefa.id === id
  );

  if (indice === -1) {
    return null;
  }

  tarefas[indice] = {
    ...tarefas[indice],
    ...dados,
    id,
  };

  return tarefas[indice];
}

function remover(id) {
  const indice = tarefas.findIndex(
    (tarefa) => tarefa.id === id
  );

  if (indice === -1) {
    return null;
  }

  return tarefas.splice(indice, 1)[0];
}

module.exports = {
  listar,
  buscar,
  listarPorColuna,
  listarPorUsuario,
  listarPorProjeto,
  adicionar,
  atualizar,
  remover,
};