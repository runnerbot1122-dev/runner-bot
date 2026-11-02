const antiLink =
require("./messages/antilink");


const menu =
require("./messages/menu");


const participantes =
require("./participants");



async function executarEventos(ctx){


await antiLink(ctx);


await menu(ctx);


}



async function executarParticipantes(
sock,
update
){


await participantes(
sock,
update
);



}



module.exports = {

executarEventos,

executarParticipantes

};
