const prisma = require("../src/database/db");
const usuarioModel = require("../src/models/usuario.model");

// Mock do Prisma para testar o model sem acessar o banco real
jest.mock("../src/database/db", () => ({
  usuario: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Testes unitários do usuarioModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("listar() deve retornar a lista de usuários sem senha_hash", async () => {
    const listaMock = [{ id: 1, nome: "Admin", email: "admin@taskflow.com" }];
    prisma.usuario.findMany.mockResolvedValue(listaMock);

    const resultado = await usuarioModel.listar();

    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      select: { id: true, nome: true, email: true },
      orderBy: { id: "asc" },
    });
    expect(resultado).toEqual(listaMock);
  });

  test("buscarPorId() deve converter o ID para número e buscar o usuário", async () => {
    const userMock = { id: 5, nome: "Maria", email: "maria@taskflow.com" };
    prisma.usuario.findUnique.mockResolvedValue(userMock);

    const resultado = await usuarioModel.buscarPorId("5");

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 5 },
      select: { id: true, nome: true, email: true },
    });
    expect(resultado).toEqual(userMock);
  });

  test("autenticar() deve funcionar tanto com (email, senha) quanto com objeto", async () => {
    const userMock = { id: 1, nome: "Admin", email: "admin@taskflow.com" };
    prisma.usuario.findFirst.mockResolvedValue(userMock);

    // 1. Chamada com parâmetros separados
    const res1 = await usuarioModel.autenticar("admin@taskflow.com", "1234");
    expect(res1).toEqual(userMock);

    // 2. Chamada passando um objeto
    const res2 = await usuarioModel.autenticar({ email: "admin@taskflow.com", senha: "1234" });
    expect(res2).toEqual(userMock);
  });

  test("autenticar() deve retornar null sem consultar o banco se faltar email ou senha", async () => {
    const resultado = await usuarioModel.autenticar("admin@taskflow.com", "");

    expect(resultado).toBeNull();
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();
  });

  test("criar() deve salvar senha_hash e retornar apenas dados públicos", async () => {
    const novoUser = { id: 2, nome: "João", email: "joao@taskflow.com" };
    prisma.usuario.create.mockResolvedValue(novoUser);

    const resultado = await usuarioModel.criar("João", "joao@taskflow.com", "senha123");

    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: { nome: "João", email: "joao@taskflow.com", senha_hash: "senha123" },
      select: { id: true, nome: true, email: true },
    });
    expect(resultado).toEqual(novoUser);
  });

  test("atualizar() deve retornar null se o usuário não existir", async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    const resultado = await usuarioModel.atualizar(999, { nome: "Novo Nome" });

    expect(resultado).toBeNull();
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  test("remover() deve retornar null se o Prisma lançar erro (ex: ID inexistente)", async () => {
    prisma.usuario.delete.mockRejectedValue(new Error("Record not found"));

    const resultado = await usuarioModel.remover(999);

    expect(resultado).toBeNull();
  });
});
