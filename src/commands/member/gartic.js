const replyNYX = require("../../utils/replyNYX");

const temas = ["um gato astronauta", "uma casa mal-assombrada", "um robô cozinheiro", "um sorvete gigante", "um super-herói atrapalhado", "um dragão no trânsito"];

module.exports = {
    name: ["gartic"],
    description: "Sorteia um desafio de desenho do Gartic",

    execute: async ctx => {
        const tema = temas[Math.floor(Math.random() * temas.length)];
        return replyNYX(ctx, `🎨 *DESAFIO GARTIC*\n\nDesenhe: *${tema}*\n\nJogue com a galera:\nhttps://garticphone.com/`, "bot");
    }
};