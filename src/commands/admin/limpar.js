const { requireAdmin } = require("../../utils/checkPermission");

const QUANTIDADE_SEPARADORES = 3;
const TAMANHO_MAXIMO = 30000; // 30k já é suficiente e é mais rápido pro M12

function criarSeparadorInvisivel() {
    // \u3164 é o "Hangul Filler", um caractere invisível que o WhatsApp NÃO apaga
    // \u200B é o Zero Width Space (também invisível, mas combinado ele engana melhor)
    // O \n quebra linha e cria o "paredão" visual vazio
    let texto = "\u3164\n";
    while (texto.length < TAMANHO_MAXIMO) {
        texto += "\u3164\n"; 
    }
    return texto;
}

async function consultarEstadoFechado(ctx) {
    try {
        const metadata = await ctx.sock.groupMetadata(ctx.chat);
        return typeof metadata?.announce === "boolean" ? metadata.announce : null;
    } catch {
        return null;
    }
}

async function tentarReabrirEConfirmar(ctx) {
    let estadoFechado = await consultarEstadoFechado(ctx);
    if (estadoFechado !== false) {
        try {
            await ctx.sock.groupSettingUpdate(ctx.chat, "not_announcement");
        } catch {}
        estadoFechado = await consultarEstadoFechado(ctx);
    }
    if (estadoFechado === false) return "aberto";
    if (estadoFechado === true) return "fechado";
    return "incerto";
}

module.exports = {
    name: "limpar",
    description: "Limpa o histórico do grupo (Método Takeshi)",

    execute: async (ctx) => {
        if (!ctx.isGroup) return ctx.reply("❌ Apenas em grupos.");
        requireAdmin(ctx);

        try {
            await ctx.sock.groupSettingUpdate(ctx.chat, "announcement");
        } catch {
            const estado = await tentarReabrirEConfirmar(ctx);
            return ctx.reply("❌ Não foi possível fechar o grupo para limpar.");
        }

        try {
            await ctx.react("🧹");

            // Pausa dramática para o grupo fechar (igual o Takeshi)
            await new Promise(r => setTimeout(r, 1500));

            const paredeInvisivel = criarSeparadorInvisivel();

            for (let i = 0; i < QUANTIDADE_SEPARADORES; i++) {
                await ctx.sock.sendMessage(ctx.chat, { text: paredeInvisivel });
                // Delay de 2 segundos entre as mensagens
                await new Promise(r => setTimeout(r, 2000)); 
            }

        } catch (erro) {
            console.error("[LIMPAR] Erro:", erro.message);
            const estado = await tentarReabrirEConfirmar(ctx);
            return ctx.reply("❌ A limpeza falhou. O grupo pode estar fechado.");
        }

        let falhaNaReabertura = false;
        try {
            await ctx.sock.groupSettingUpdate(ctx.chat, "not_announcement");
        } catch {
            falhaNaReabertura = true;
        }

        const estadoFechado = await consultarEstadoFechado(ctx);
        if (estadoFechado === false && !falhaNaReabertura) {
            return ctx.reply("✅ Grupo limpo com sucesso!");
        }
        if (estadoFechado === true) {
            return ctx.reply("⚠️ A limpeza foi feita, mas o grupo pode continuar fechado. Verifique manualmente.");
        }
        return ctx.reply("⚠️ A limpeza foi concluída, mas não deu pra confirmar o estado do grupo.");
    }
};