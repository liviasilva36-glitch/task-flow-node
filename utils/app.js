const somar = require('./somar');

console.log(somar(2,3));
console.log(somar(10,5));

const tarefasultils = require('./ultils/tarefas');

const {listarTodas, adiconar } = require ('./ultils/tarefs');

adiconar({ id: 1 , texto: 'Estudar Node' , coluna: 'afazer'});
console.log(listarTodas());
