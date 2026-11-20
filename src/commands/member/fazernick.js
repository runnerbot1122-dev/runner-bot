const replyNYX = require("../../utils/replyNYX");
const fonteNYX = require("../../utils/fonteNYX");

function fullwidth(texto) {
    return texto.replace(/[!-~]/g, char => String.fromCharCode(char.charCodeAt(0) + 0xfee0));
}

function circled(texto) {
    const normal = "abcdefghijklmnopqrstuvwxyz";
    const circles = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
    return texto.toLowerCase().split("").map(char => {
        const index = normal.indexOf(char);
        return index >= 0 ? circles[index] : char;
    }).join("");
}

module.exports = {
    name: ["fazernick"],
    description: "Gera apelidos estilizados",

    execute: async ctx => {
        const nick = ctx.args.join(" ").trim();
        if (!nick) {
            return replyNYX(ctx, `✍️ Informe um apelido.\n\nUso: ${ctx.prefix}fazernick Seu Nome`, "bot");
        }

        const texto =
`✍️ *NICKS GERADOS*

1. ${fonteNYX(nick)}
2. 『${nick}』
3. ꧁${nick}꧂
4. ${fullwidth(nick)}
5. ${circled(nick)}
6. •° ${nick} °•`;

        return replyNYX(ctx, texto, "bot");
    }
};
