async criar(req, res, next) {
    try {
      // Aceita tanto 'texto' quanto 'titulo' ou 'tarefa' enviados pelo frontend
      const textoInput = req.body.texto || req.body.titulo || req.body.tarefa;
      const {
        prioridade = "media",
        coluna = "afazer",
        projetoId,
      } = req.body;

      const usuarioIdRaw = req.usuario?.id || req.body.usuarioId || req.body.usuario_id;

      if (!textoInput || !textoInput.trim()) {
        throw criarErro(400, "Texto/Título da tarefa é obrigatório");
      }

      const parsedUsuarioId = Number(usuarioIdRaw);
      if (!usuarioIdRaw || isNaN(parsedUsuarioId)) {
        throw criarErro(400, "usuarioId válido é obrigatório para associar a tarefa");
      }

      if (!prioridadesValidas.includes(prioridade)) {
        throw criarErro(400, "Prioridade inválida", prioridadesValidas);
      }

      if (!colunasValidas.includes(coluna)) {
        throw criarErro(400, "Coluna inválida", colunasValidas);
      }

      if (coluna === "andamento") {
        const andamento = await tarefasModel.listarPorColuna("andamento");

        if (andamento.length >= LIMITE_ANDAMENTO) {
          throw criarErro(409, `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`);
        }
      }

      // Trata projetoId: se vier string vazia, null, undefined ou 'NaN', envia null ao Prisma
      const parsedProjetoId = projetoId && !isNaN(Number(projetoId)) ? Number(projetoId) : null;

      const novaTarefa = await tarefasModel.adicionar({
        texto: textoInput.trim(),
        prioridade,
        coluna,
        usuarioId: parsedUsuarioId,
        projetoId: parsedProjetoId,
        dataConclusao: coluna === "concluido" ? new Date().toISOString() : null,
      });

      res.status(201).json(novaTarefa);
    } catch (erro) {
      next(erro);
    }
  };