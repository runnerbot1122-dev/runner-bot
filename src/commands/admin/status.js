const { getBotEmoji } = require("../../utils/botEmoji");
const { getBotName } = require("../../utils/botNameStore");
const fonteNYX = require("../../utils/fonteNYX");
const { getGroup } = require("../../utils/groups");
const config = require("../../config/config");
const { requireAdmin } = require("../../utils/checkPermission");

function ligado(valor) {
    return valor ? "✅ ON" : "❌ OFF";
}

function formatarUptime(segundos) {
    const total = Math.max(0, Math.floor(segundos));
    const dias = Math.floor(total / 86400);
    const horas = Math.floor((total % 86400) / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundosRestantes = total % 60;
    return `${dias}d ${horas}h ${minutos}m ${segundosRestantes}s`;
}

function numeroJid(jid) {
    return String(jid || "").split("@")[0].split(":")[0] || "Não identificado";
}

module.exports = {
    name: "status",
    description: "Mostra configurações completas do grupo e informações do bot",

    execute: async ctx => {
        requireAdmin(ctx);

        if (!ctx.isGroup) {
            return ctx.reply("❌ Esse comando só funciona em grupos.");
        }

        const grupo = getGroup(ctx.chat);
        const s = grupo.settings || {};
        let metadata = null;

        try {
            metadata = await ctx.sock.groupMetadata(ctx.chat);
        } catch (error) {
            console.log("Erro pegando metadata do grupo:", error.message);
        }

        const participantes = Array.isArray(metadata?.participants) ? metadata.participants : [];
        const admins = participantes.filter(participante => Boolean(participante.admin)).length;
        const nomeGrupo = metadata?.subject || "Desconhecido";
        const criador = numeroJid(metadata?.owner || metadata?.subjectOwner);
        const botJid = numeroJid(ctx.sock.user?.id);
        const extras = Array.isArray(s.extrasPrefixos) && s.extrasPrefixos.length
            ? s.extrasPrefixos.join(", ")
            : "Nenhum";
        const reacoes = Array.isArray(s.reactionKeywords) ? s.reactionKeywords.length : 0;
        const respostas = Array.isArray(s.autoReplies) ? s.autoReplies.length : 0;
        const limiteCaracteres = s.limiteCaracteres || s.limiteCaracteres === 0 ? s.limiteCaracteres : "Desativado";
        const tempoComando = Number(s.tempoComando) > 0 ? `${s.tempoComando}s` : "Desativado";
        const versaoWhatsApp = Array.isArray(ctx.sock?.ws?.config?.version)
            ? ctx.sock.ws.config.version.join(".")
            : "Baileys";

        const emoji = getBotEmoji();
        const linha = (rotulo, valor) => `║╎⊹ ࣪ ˖ ${emoji} ▸ ${fonteNYX(rotulo)}: ${valor}`;

        const texto = `
╔═━✰『 ${emoji} ${fonteNYX(getBotName())} 』━═╗

╠═✰『 ɢʀᴜᴘᴏ 』
${linha("NOME", nomeGrupo)}
${linha("ID", ctx.chat)}
${linha("MEMBROS", participantes.length)}
${linha("ADMINS", admins)}
${linha("CRIADOR", criador)}

╠═✰『 ʙᴏᴛ / sɪsᴛᴇᴍᴀ 』
${linha("STATUS", "🟢 ONLINE")}
${linha("NÚMERO", botJid)}
${linha("VERSÃO", config.version || "Não definida")}
${linha("NODE", process.version)}
${linha("WHATSAPP", versaoWhatsApp)}
${linha("PLATAFORMA", `${process.platform} ${process.arch}`)}
${linha("UPTIME", formatarUptime(process.uptime()))}
${linha("MEMÓRIA", `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB RSS`)}

╠═✰『 ᴘʀᴏᴛᴇᴄ̧ᴏ̃ᴇs 』
${linha("ANTILINK", ligado(s.antilink))}
${linha("ANTI-IMAGEM", ligado(s.antiImg))}
${linha("ANTI-VÍDEO", ligado(s.antiVideo))}
${linha("ANTI-ÁUDIO", ligado(s.antiAudio))}
${linha("ANTI-STICKER", ligado(s.antiSticker))}
${linha("ANTI-DOCUMENTO", ligado(s.antiDoc || s.antiDocumento))}
${linha("ANTI-CONTATO", ligado(s.antiContato))}
${linha("ANTI-CATÁLOGO", ligado(s.antiCatalogo))}
${linha("ANTI-TRAVA", ligado(s.antiTrava))}
${linha("ANTI-LINK HARD", ligado(s.antilinkhard))}
${linha("ANTI-SPAM", ligado(s.antiSpam))}
${linha("ANTI-FLOOD", ligado(s.antiFlood))}
${linha("ANTI-FAKE", ligado(s.antiFake))}
${linha("ANTI-PALAVRA", ligado(s.antiPalavra))}
${linha("ANTI-DDD", ligado(s.antiDdd))}
${linha("ANTI-STATUS", ligado(s.antiStatus))}
${linha("ANTI-LIGAÇÃO", ligado(s.antiLigacao))}

╠═✰『 ᴄᴏɴғɪɢᴜʀᴀᴄ̧ᴀ̃ᴏ 』
${linha("PREFIXO", s.prefix || config.prefix || "7")}
${linha("PREFIXOS EXTRAS", extras)}
${linha("BOT OFF", ligado(s.botOff))}
${linha("SÓ ADM", ligado(s.soadm))}
${linha("XP", ligado(s.xpEnabled !== false))}
${linha("TEMPO DE COMANDO", tempoComando)}
${linha("LIMITE DE TEXTO", limiteCaracteres)}

╠═✰『 ᴀᴜᴛᴏᴍᴀᴄ̧ᴏ̃ᴇs 』
${linha("BEM-VINDO", ligado(s.welcome))}
${linha("AUTO-LEITURA", ligado(s.autoRead))}
${linha("AUTO-DIGITAÇÃO", ligado(s.autoTyping))}
${linha("AUTO-REPO", ligado(s.autoRepo))}
${linha("AUTO-STICKER", ligado(s.autoSticker))}
${linha("AUTO-FIGURINHA", ligado(s.autoFigu))}
${linha("AUTO-TEXTO", ligado(s.autoToText))}

╠═✰『 ᴇxᴛʀᴀs 』
${linha("PALAVRAS DE REAÇÃO", reacoes)}
${linha("RESPOSTAS AUTOMÁTICAS", respostas)}
${linha("EMOJI GLOBAL", emoji)}

╚═━═━═━═━ ${fonteNYX("DEV EZ")} ━═━═━═━✰
`;

        return ctx.replyNYX({ image: { url: "./assets/status.jpg" }, caption: texto }, "bot");
    }
};
