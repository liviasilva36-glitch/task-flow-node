const fs   = require('fs');
const path = require('path');
const os   = require('os');

console.log('===AMBIENTE===');
console.log('Node.js:', process.version);
console.log('Sistema:', os.platform());
console.log('Pata atual:' , __dirname);

console.log('');
console.log('===ARQUVIOS NA PASTA===');
const arquivos = fs.readdirSync('.');
arquivos.forEach (arquivos => {
    console.log ('-' , arquivos);
});

console.log ('');
console.log('===CAMINHO DO FUTURO SERVIDOR===');
const caminhoServidor = path.join(__dirname, 'src', 'server.js')
console.log ('O serrvidor ficara em:' , caminhoServidor);

const arquivosJS = arquivos.filter(a => a.endsWith('.js'));
console.log('');
console.log(`Arquivos.js encontrados: ${arquivosJS.length}`);