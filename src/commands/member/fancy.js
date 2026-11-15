const replyNYX = require("../../utils/replyNYX");

const normalChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const estilos = {
    // Fontes 100% compatíveis com qualquer celular
    smallcaps: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    fullwidth: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９",
    bolinha: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨",
    circulo: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩0123456789",
    quadrado: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789"
};

function converterTexto(texto, tipoEstilo) {
    const mapa = estilos[tipoEstilo];
    if (!mapa) return texto;

    return texto.split("").map(char => {
        const index = normalChars.indexOf(char);
        return index !== -1 ? mapa[index] : char;
    }).join("");
}

module.exports = {
    name: ["fancy", "font"],
    description: "Transforma o texto em letras estilizadas",
    execute: async (ctx) => {
        const tipo = ctx.args[0]?.toLowerCase();
        const texto = ctx.args.slice(1).join(" ");

        if (!texto) {
            const listaEstilos = Object.keys(estilos).join(", ");
            return replyNYX(ctx, 
                `✍️ *FANCY TEXT*\n\nUso: *${ctx.prefix}fancy <estilo> <texto>*\n\nEstilos disponíveis:\n${listaEstilos}\n\nExemplo: *${ctx.prefix}fancy bolinha Ola mundo*`, 
                "bot"
            );
        }

        if (!estilos[tipo]) {
            const listaEstilos = Object.keys(estilos).join(", ");
            return replyNYX(ctx, `❌ Estilo inválido!\n\nEscolha um desses: ${listaEstilos}`, "bot");
        }

        try {
            const textoConvertido = converterTexto(texto, tipo);
            await replyNYX(ctx, textoConvertido, "bot");
        } catch (error) {
            console.error("[FANCY] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao converter o texto.", "bot");
        }
    }
};