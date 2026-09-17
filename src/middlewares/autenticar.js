const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ erro: 'Formato de token inválido' });
    }

    const token = partes[1];
    const secretkey = process.env.JWT_SECRET || 'sua_chave_secreta_padrao_123';

    try {
        const decodificado = jwt.verify(token, secretkey);
        req.usuario = decodificado; // Anexa o payload do token na requisição
        return next();
      } catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
}
}
module.exports = autenticar;
