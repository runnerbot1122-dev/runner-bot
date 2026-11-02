const { getBotName } = require("../../utils/botNameStore");
const fonteNYX = require("../../utils/fonteNYX");

const { getGroup } = require("../../utils/groups");
const config = require("../../config/config");
const { requireAdmin } = require("../../utils/checkPermission");

module.exports = {
    name: "status",
    description: "Mostra configurações do grupo",

    execute: async (ctx) => {
        requireAdmin(ctx);

        if (!ctx.isGroup) {
            return ctx.reply("❌ Esse comando só funciona em grupos.");
        }

        const grupo = getGroup(ctx.chat);

        let nomeGrupo = "Desconhecido";
        let membros = 0;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.chat);
            nomeGrupo = metadata.subject;
            membros = metadata.participants.length;
        } catch (e) {
            console.log("Erro pegando metadata do grupo:", e.message);
        }

        const s = grupo.settings;
        const ligado = (valor) => valor ? "✅ ON" : "❌ OFF";
        const uptime = Math.floor(process.uptime() / 60);

        const texto = `
╔═━✰『 💸 ${fonteNYX(getBotName())} 』━═╗

╠═✰『 ɪɴғᴏʀᴍᴀᴄ̧ᴏ̃ᴇs ᴅᴏ ɢʀᴜᴘᴏ 』
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("NOME")}: ${nomeGrupo}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("MEMBROS")}: ${membros}

╠═✰『 sɪsᴛᴇᴍᴀ 』
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("STATUS")}: 🟢 ONLINE
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("VERSÃO")}: ${config.version}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("UPTIME")}: ${uptime} minutos

╠═✰『 ᴘʀᴏᴛᴇᴄ̧ᴏ̃ᴇs 』
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("ANTILINK")}: ${ligado(s.antilink)}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("ANTISPAM")}: ${ligado(s.antiSpam)}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("ANTIFLOOD")}: ${ligado(s.antiFlood)}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("WELCOME")}: ${ligado(s.welcome)}

╠═✰『 ᴄᴏɴғɪɢᴜʀᴀᴄ̧ᴀ̃ᴏ 』
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("PREFIXO")}: ${s.prefix}
║╎⊹ ࣪ ˖ 💸 ▸ ${fonteNYX("BOTOFF")}: ${ligado(s.botOff)}

╚═━═━═━═━ ${fonteNYX("DEV EZ")} ━═━═━═━✰
`;

        await ctx.replyNYX(
            {
                image: { url: "./assets/status.jpg" },
                caption: texto
            },
            "bot"
        );
    }
};
