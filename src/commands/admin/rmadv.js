const {
    removeWarn,
    getUser
} = require("../../utils/users");

const resolveUser = require("../../utils/resolveUser");

const {
    requireAdmin
} = require("../../utils/checkPermission");

const {
    podePunir,
    getTarget
} = require("../../utils/checkTarget");

const logger = require("../../utils/logger");

module.exports = {
    name: [
        "rmadv",
        "removeradv",
        "tiraradv"
    ],

    execute: async (ctx) => {
        requireAdmin(ctx);

        const alvo = getTarget(ctx);

        if (!alvo) {
            return ctx.replyNYX("⚠️ Marque o usuário que deseja remover a advertência.", "user");
        }

        const alvoReal = await resolveUser(
            ctx.sock,
            ctx.chat,
            alvo
        );

        const protecao = podePunir(
            ctx,
            alvoReal
        );

        if (!protecao.permitido) {
            return ctx.replyNYX("❌ Não posso alterar advertências deste usuário.", "user");
        }

        const usuario = getUser(alvoReal);

        if (usuario.warnings <= 0) {
            return ctx.replyNYX(
                "╔═━✰『 ᴀᴠɪsᴏ 』═━✰\n\n║╎⊹ ࣪ ˖ ⚠️ ▸ ᴇsᴛᴇ ᴜsᴜáʀɪᴏ ɴãᴏ ᴘᴏssᴜɪ ᴀᴅᴠᴇʀᴛᴇ̂ɴᴄɪᴀs.\n\n╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰",
                "bot"
            );
        }

        const user = removeWarn(alvoReal);

        // =========================================
        // LOG PRIVADO
        // =========================================
        await logger.action(
            ctx.sock,
            {
                acao: "⚠️ RMADV",
                executor: ctx.sender,
                alvo: alvoReal,
                grupo: ctx.chat
            }
        );

        // =========================================
        // AVISO NO GRUPO
        // =========================================
        const data = new Date().toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        await ctx.replyNYX(
            {
                text:
`╔═━✰『 ᴀᴅᴠ ʀᴇᴍᴏᴠɪᴅᴀ 』═━✰

║╎⊹ ࣪ ˖ 👤 ▸ @${alvoReal.split("@")[0]}
║╎⊹ ࣪ ˖ 📋 ▸ ᴀᴅᴠᴇʀᴛᴇ̂ɴᴄɪᴀs: *[ ${user.warnings}/3 ]*
║╎⊹ ࣪ ˖ 📅 ▸ ${data}

║╎⊹ ࣪ ˖ 💠 ▸ ᴄᴏᴍᴘᴏʀᴛᴇ-sᴇ ɴᴏ ɢʀᴜᴘᴏ.

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`,
                mentions: [alvoReal]
            },
            "user"
        );
    }
};