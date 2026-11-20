const replyNYX = require("../../utils/replyNYX");

function amazonSearchUrl(query) {
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`;
}

module.exports = {
    name: ["amazonsearch"],
    description: "Pesquisa produtos na Amazon Brasil",

    execute: async ctx => {
        const query = ctx.args.join(" ").trim();

        if (!query) {
            return replyNYX(
                ctx,
                `🛒 *AMAZON SEARCH*\n\nUso: ${ctx.prefix}amazonsearch [produto]\nEx: ${ctx.prefix}amazonsearch teclado gamer`,
                "bot"
            );
        }

        const url = amazonSearchUrl(query);
        return replyNYX(
            ctx,
            `🛒 *BUSCA NA AMAZON BRASIL*\n\nProduto: *${query}*\n\n🔗 ${url}`,
            "bot"
        );
    }
};

module.exports.amazonSearchUrl = amazonSearchUrl;