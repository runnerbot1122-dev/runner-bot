const axios = require("axios");
const replyNYX = require("../../utils/replyNYX");

function uniqueLinks(html) {
    const links = html.match(/https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/gi) || [];
    return [...new Set(links)].slice(0, 8);
}

module.exports = {
    name: ["gruposwhatsapp"],
    description: "Busca links públicos de grupos do WhatsApp",

    execute: async ctx => {
        const query = ctx.args.join(" ").trim();

        if (!query) {
            return replyNYX(
                ctx,
                `👥 *GRUPOS DO WHATSAPP*\n\nUso: ${ctx.prefix}gruposwhatsapp [tema]\nEx: ${ctx.prefix}gruposwhatsapp futebol`,
                "bot"
            );
        }

        try {
            await ctx.react("👥");
        } catch (error) {}

        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:chat.whatsapp.com ${query}`)}`;

        try {
            const response = await axios.get(searchUrl, {
                headers: { "User-Agent": "Mozilla/5.0" },
                timeout: 15000,
                maxContentLength: 5 * 1024 * 1024
            });

            const links = uniqueLinks(response.data);
            if (!links.length) {
                return replyNYX(
                    ctx,
                    `❌ Não encontrei links públicos para *${query}*.\n\n🔎 Tente pesquisar diretamente:\n${searchUrl}`,
                    "bot"
                );
            }

            let texto = `╔═━✰『 ɢʀᴜᴘᴏs ᴡʜᴀᴛsᴀᴘᴘ 』═━✰\n\n`;
            texto += `🔎 Tema: *${query}*\n\n`;
            links.forEach((link, index) => {
                texto += `${index + 1}. ${link}\n\n`;
            });
            texto += "⚠️ Links públicos podem expirar. Entre somente em grupos confiáveis.\n\n";
            texto += "╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰";

            return replyNYX(ctx, texto, "bot");
        } catch (error) {
            console.error("[GRUPOSWHATSAPP] Erro:", error.message);
            return replyNYX(ctx, `❌ Não consegui pesquisar agora.\n\n🔎 ${searchUrl}`, "bot");
        }
    }
};
