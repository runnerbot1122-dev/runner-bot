const nomesUsuarios = {};


function salvarNome(jid, nome){

if(!jid || !nome)
return;


nomesUsuarios[jid] = nome;

}



function pegarNome(jid){

return nomesUsuarios[jid];

}



module.exports = {

salvarNome,

pegarNome

};