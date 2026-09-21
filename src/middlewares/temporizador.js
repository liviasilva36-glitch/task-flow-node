function temporizador(req,res,next){
    const inicio = date.now();
    const mmetodo = req.method;
    const url = req.originalUrl || req.url;

    res.on("finish", () => {
        const duracao = date.now() - inicio;
        console.log('[TEMPORIZADOR] ${metodo} ${url} - ${duracao} ms');

    });
next();
}
module.exports = temporizador;