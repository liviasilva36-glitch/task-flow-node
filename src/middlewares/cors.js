// const corsMiddlewares = require('./middlewares/cors');

// app.use(corsMiddlewares);

// function corsMiddlewares(req, res, next) {


//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Methods',
//         'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers',
//         'Content-Type, Authorization');
//     res.setHeader('Access-Control-Max-Age', '86400');
//     if (req.method === 'OPTIONS') {
//         return res.sendStatus(200);
//     }
//     next();
// }
// module.exports = corsMiddleware;

const allowedOrigins = [
    'http://localhost:5173',
    'https://task-flow-frontend-teal.vercel.app'
];

function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;

    // Se a origem da requisição estiver na nossa lista permitida, liberamos ela dinamicamente
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Responde imediatamente a requisições do tipo Preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
}

module.exports = corsMiddleware;