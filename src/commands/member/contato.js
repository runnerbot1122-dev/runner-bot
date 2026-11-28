const replyNYX = require("../../utils/replyNYX");

function limparCampo(valor, fallback = "") {
    return String(valor || fallback)
        .replace(/[\r\n]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function escaparVCard(valor) {
    return limparCampo(valor)
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");
}

function normalizarTelefone(valor) {
    const original = limparCampo(valor);
    const digitos = original.replace(/\D/g, "");
    const temSinalInternacional = original.startsWith("+");

    return {
        digitos,
        formato: `${temSinalInternacional ? "+" : ""}${digitos}`,
        valido: digitos.length >= 8 && digitos.length <= 15
    };
}

function montarVCard(nome, telefone, empresa) {
    const linhas = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escaparVCard(nome)}`,
        `N:${escaparVCard(nome)};;;;`,
        `TEL;TYPE=CELL;TYPE=VOICE;waid=${telefone.digitos}:${telefone.formato}`
    ];

    if (empresa) linhas.push(`ORG:${escaparVCard(empresa)}`);

    linhas.push("END:VCARD");
    return linhas.join("\r\n");
}

module.exports = {
    name: ["contato", "vcard", "vcf"],
    description: "Gera um contato vCard",
    execute: async (ctx) => {
        const entrada = (ctx.args || []).join(" ").trim();

        if (!entrada) {
            return replyNYX(
                ctx,
                `👤 *CONTATO*\n\nUso: *${ctx.prefix}contato Nome | telefone | empresa*\nExemplo: *${ctx.prefix}contato Maria Silva | +55 11 99999-9999 | Runner Bot*`,
                "bot"
            );
        }

        const partes = entrada
            .split(/\s*[|;]\s*/)
            .map((parte) => limparCampo(parte));
        const nome = partes[0] || "";
        const telefone = normalizarTelefone(partes[1]);
        const empresa = partes[2] || "";

        if (partes.length < 2) {
            return replyNYX(
                ctx,
                `❌ Informe o nome e o telefone separados por *|*.\nExemplo: *${ctx.prefix}contato Maria | +55 11 99999-9999*`,
                "bot"
            );
        }

        if (!nome || nome.length > 100) {
            return replyNYX(ctx, "❌ O nome deve ter entre 1 e 100 caracteres.", "bot");
        }

        if (!telefone.valido) {
            return replyNYX(ctx, "❌ Informe um telefone válido com DDI e DDD quando necessário.", "bot");
        }

        if (empresa.length > 100) {
            return replyNYX(ctx, "❌ O nome da empresa deve ter no máximo 100 caracteres.", "bot");
        }

        try { await ctx.react("👤"); } catch (e) {}

        try {
            return await ctx.sock.sendMessage(
                ctx.chat,
                {
                    contacts: {
                        displayName: nome,
                        contacts: [{
                            displayName: nome,
                            vcard: montarVCard(nome, telefone, empresa)
                        }]
                    }
                },
                { quoted: ctx.message }
            );
        } catch (error) {
            console.error("[CONTATO] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui gerar esse contato agora.", "bot");
        }
    }
};
