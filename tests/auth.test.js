const request = require("supertest");
const express = require("express");
const authRoutes = require("../src/routes/auth.routes");
const usuarioModel = require("../src/models/usuario.model");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Testes da rota POST /auth/login", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Deve retornar 400 se email ou senha não forem enviados", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@taskflow.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ erro: "Email e senha são obrigatórios" });
  });

  test("Deve retornar 401 se usuário ou senha estiverem incorretos", async () => {
    jest.spyOn(usuarioModel, "autenticar").mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@taskflow.com", senha: "senha_errada" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ erro: "Usuário ou senha incorretos" });
  });

  test("Deve retornar 200 com token JWT e dados do usuário no login válido", async () => {
    const usuarioMock = { id: 1, nome: "Admin", email: "admin@taskflow.com" };
    jest.spyOn(usuarioModel, "autenticar").mockResolvedValue(usuarioMock);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@taskflow.com", senha: "1234" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.usuario).toEqual(usuarioMock);
  });

  test("Deve retornar 500 se ocorrer um erro inesperado no servidor", async () => {
    jest.spyOn(usuarioModel, "autenticar").mockRejectedValue(new Error("Falha de conexão"));

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@taskflow.com", senha: "1234" });

    expect(res.statusCode).toBe(500);
    expect(res.body.erro).toBe("Erro interno no servidor");
  });
});
