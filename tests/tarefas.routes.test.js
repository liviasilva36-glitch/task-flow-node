const request = require("supertest");
const express = require("express");
const tarefasRoutes = require("../src/routes/tarefas.routes");
const tarefaModel = require("../src/models/tarefa.model");

jest.mock("../src/models/tarefa.model");

const app = express();
app.use(express.json());
app.use("/tarefas", tarefasRoutes);

// Middleware de erro para capturar falhas de validação ou erros do controller
app.use((err, req, res, next) => {
  res.status(err.statusCode || err.status || 500).json({
    erro: err.message || "Erro interno",
  });
});

describe("Testes das rotas /tarefas", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /tarefas deve retornar 200 com a lista de tarefas mockada", async () => {
    const listaMock = [{ id: 1, texto: "Estudar Jest", coluna: "afazer" }];
    tarefaModel.listar.mockResolvedValue(listaMock);

    const res = await request(app).get("/tarefas");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(listaMock);
    expect(tarefaModel.listar).toHaveBeenCalledTimes(1);
  });

  test("GET /tarefas/:id deve rejeitar ID não numérico com 400", async () => {
    const res = await request(app).get("/tarefas/abc");

    expect(res.statusCode).toBe(400);
    expect(tarefaModel.buscar).not.toHaveBeenCalled();
  });

  test("GET /tarefas/:id deve retornar 200 quando a tarefa existir", async () => {
    const tarefaMock = { id: 1, texto: "Tarefa 1", coluna: "afazer" };
    tarefaModel.buscar.mockResolvedValue(tarefaMock);

    const res = await request(app).get("/tarefas/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(tarefaMock);
  });

  test("GET /tarefas/:id deve retornar 404 quando a tarefa não existir", async () => {
    tarefaModel.buscar.mockResolvedValue(null);

    const res = await request(app).get("/tarefas/999");

    expect(res.statusCode).toBe(404);
  });

  test("POST /tarefas deve rejeitar payload inválido antes de chamar o model", async () => {
    const res = await request(app)
      .post("/tarefas")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(tarefaModel.adicionar).not.toHaveBeenCalled();
  });

  test("DELETE /tarefas/:id deve retornar 200 ao remover uma tarefa existente", async () => {
    tarefaModel.remover.mockResolvedValue({ id: 1, texto: "Tarefa removida" });

    const res = await request(app).delete("/tarefas/1");

    expect(res.statusCode).toBe(200);
    expect(tarefaModel.remover).toHaveBeenCalledWith(1);
  });

  test("DELETE /tarefas/:id deve retornar 404 se a tarefa não existir", async () => {
    tarefaModel.remover.mockResolvedValue(null);

    const res = await request(app).delete("/tarefas/999");

    expect(res.statusCode).toBe(404);
  });
});
