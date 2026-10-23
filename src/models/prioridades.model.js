const prisma = require("../database/db"); 
const prioridade = {
    // 1. Listar todas as prioridades ordenadas por ID
    listar: async () => {
        return await prisma.prioridades.findMany({
            select: {
                id: true,
                nome: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
    },

    // 2. Contar a quantidade de tarefas por prioridade
    contarTarefasPorPrioridade: async () => {
        const resultado = await prisma.prioridades.findMany({
            select: {
                id: true,
                nome: true,
                _count: {
                    select: {
                        tarefas: true,
                    },
                },
            },
            orderBy: {
                id: 'asc',
            },
        });

        return resultado.map((p) => ({
            id: p.id,
            nome: p.nome,
            quantidade_tarefas: p._count.tarefas,
        }));
    },
};

module.exports = prioridade;