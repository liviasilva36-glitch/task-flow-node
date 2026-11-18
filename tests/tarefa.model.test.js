const prisma = require("../src/lib/prisma");
const tarefaModel = require("../src/models/tarefa.model");

jest.mock("../src/lib/prisma", () => ({
  tarefa: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Testes unitários do tarefaModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("listar() deve retornar tarefas formatadas com colunas mapeadas para o frontend", async () => {
    prisma.tarefa.findMany.mockResolvedValue([
      {
        id: 1,
        texto: "Configurar deploy",
        coluna: "doing",
        ordem: 1,
        usuario_id: 2,
        projeto_id: 5,
        prioridade_id: 3,
        usuarios: { nome: "Admin" },
        projetos: { nome: "TaskFlow" },
        prioridades: { nome: "Alta", cor: "#ff0000" },
      },
    ]);

    const resultado = await tarefaModel.listar();

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({
      id: 1,
      texto: "Configurar deploy",
      coluna: "andamento",
      usuario: "Admin",
      projeto: "TaskFlow",
      prioridade: "Alta",
      prioridade_cor: "#ff0000",
    });
  });

  test("adicionar() deve mapear coluna do front para o banco e criar a tarefa", async () => {
    prisma.tarefa.create.mockResolvedValue({
      id: 10,
      texto: "Nova tarefa",
      coluna: "todo",
      ordem: 0,
      usuario_id: 1,
      projeto_id: null,
      prioridade_id: 2,
    });

    const resultado = await tarefaModel.adicionar({
      texto: "Nova tarefa",
      coluna: "afazer",
      usuarioId: 1,
      prioridadeId: 2,
    });

    expect(prisma.tarefa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          texto: "Nova tarefa",
          coluna: "todo",
          usuario_id: 1,
          prioridade_id: 2,
        }),
      })
    );
    expect(resultado.coluna).toBe("afazer");
  });

  test("adicionar() deve lançar erro 400 se usuario_id não for informado", async () => {
    await expect(
      tarefaModel.adicionar({ texto: "Sem dono", prioridade_id: 1 })
    ).rejects.toMatchObject({
      message: "usuario_id válido é obrigatório.",
      statusCode: 400,
    });
  });

  test("adicionar() deve lançar erro 400 se prioridade não estiver entre 1, 2 ou 3", async () => {
    await expect(
      tarefaModel.adicionar({ texto: "Prioridade inválida", usuario_id: 1, prioridade_id: 9 })
    ).rejects.toMatchObject({
      message: "ID de prioridade inválido.",
      statusCode: 400,
    });
  });

  test("adicionar() deve converter erro P2003 (chave estrangeira) em erro 400", async () => {
    const erroPrisma = new Error("Foreign key constraint failed");
    erroPrisma.code = "P2003";
    prisma.tarefa.create.mockRejectedValue(erroPrisma);

    await expect(
      tarefaModel.adicionar({ texto: "Projeto inexistente", usuario_id: 1, prioridade_id: 1, projeto_id: 999 })
    ).rejects.toMatchObject({
      message: "Um dos ids informados não existe",
      statusCode: 400,
    });
  });

  test("atualizar() deve preencher iniciada_em ao mover para 'andamento' e concluida_em ao mover para 'concluido'", async () => {
    prisma.tarefa.findUnique.mockResolvedValue({
      id: 1,
      texto: "Implementar testes",
      coluna: "todo",
      prioridade_id: 2,
      usuario_id: 1,
      projeto_id: null,
      iniciada_em: null,
      concluida_em: null,
    });

    prisma.tarefa.update.mockImplementation(async ({ data }) => ({
      id: 1,
      texto: data.texto,
      coluna: data.coluna,
      prioridade_id: data.prioridade_id,
      usuario_id: data.usuario_id,
      projeto_id: data.projeto_id,
      iniciada_em: data.iniciada_em,
      concluida_em: data.concluida_em,
    }));

    const emAndamento = await tarefaModel.atualizar(1, { coluna: "andamento" });
    expect(emAndamento.coluna).toBe("andamento");
    expect(emAndamento.iniciadaEm).toBeInstanceOf(Date);
    expect(emAndamento.concluidaEm).toBeUndefined();

    const concluida = await tarefaModel.atualizar(1, { coluna: "concluido" });
    expect(concluida.coluna).toBe("concluido");
    expect(concluida.concluidaEm).toBeInstanceOf(Date);
  });

  test("atualizar() deve retornar null se o ID não existir", async () => {
    prisma.tarefa.findUnique.mockResolvedValue(null);

    const resultado = await tarefaModel.atualizar(999, { texto: "Nada" });
    expect(resultado).toBeNull();
  });

  test("remover() deve retornar null quando o Prisma retornar código P2025", async () => {
    const erroNaoEncontrado = new Error("Record to delete does not exist");
    erroNaoEncontrado.code = "P2025";
    prisma.tarefa.delete.mockRejectedValue(erroNaoEncontrado);

    const resultado = await tarefaModel.remover(999);
    expect(resultado).toBeNull();
  });
});
