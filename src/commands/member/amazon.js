const replyNYX = require("../../utils/replyNYX");

const AMAZON_HOSTS = new Set([
    "amazon.com.br",
    "www.amazon.com.br",
    "amazon.com",
    "www.amazon.com",
    "amzn.to",
    "www.amzn.to",
    "link.amazon"
]);

function isAmazonUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) && AMAZON_HOSTS.has(url.hostname.toLowerCase());
    } catch (error) {
        return false;
    }
}

function canonicalProductUrl(value) {
    const match = String(value).match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i);
    if (match) return `https://www.amazon.com.br/dp/${match[1].toUpperCase()}`;
    return value;
}

module.exports = {
    name: ["amazon"],
    description: "Normaliza links e pesquisas da Amazon Brasil",

    execute: async ctx => {
        const input = ctx.args.join(" ").trim();

        if (!input) {
            return replyNYX(
                ctx,
                `🛒 *AMAZON*\n\nUse um produto ou link da Amazon.\nEx: ${ctx.prefix}amazon Echo Dot\nEx: ${ctx.prefix}amazon https://www.amazon.com.br/dp/XXXXXXXXXX`,
                "bot"
            );
        }

        if (isAmazonUrl(input)) {
            const url = canonicalProductUrl(input);
            return replyNYX(
                ctx,
                `🛒 *LINK DA AMAZON*\n\n🔗 ${url}`,
                "bot"
            );
        }

        if (/^\d{10}$/.test(input)) {
            return replyNYX(
                ctx,
                `🛒 *PRODUTO DA AMAZON*\n\n🔗 https://www.amazon.com.br/dp/${input}`,
                "bot"
            );
        }

        const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(input)}`;
        return replyNYX(
            ctx,
            `🛒 *BUSCA NA AMAZON BRASIL*\n\nProduto: *${input}*\n\n🔗 ${url}`,
            "bot"
        );
    }
};