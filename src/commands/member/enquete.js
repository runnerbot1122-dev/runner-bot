const replyNYX = require("../../utils/replyNYX");
const fonteNYX = require("../../utils/fonteNYX");

const LIMITE_PERGUNTA = 300;
const LIMITE_OPCAO = 100;
const MAX_OPCOES = 12;

function limparTexto(valor) {
    return String(valor || "")
        .replace(/[\r\n]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function removerDuplicadas(opcoes) {
    const vistas = new Set();
    return opcoes.filter((opcao) => {
        const chave = opcao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (vistas.has(chave)) return false;
        vistas.add(chave);
        return true;
    });
}

module.exports = {
    name: ["enquete", "poll"],
    description: "Cria uma enquete nativa do WhatsApp",
    execute: async (ctx) => {
        const entrada = (ctx.args || []).join(" ").trim();

        if (!entrada) {
            return replyNYX(
                ctx,
                `📊 *ENQUETE*\n\nUso: *${ctx.prefix}enquete Pergunta | Opção 1 | Opção 2*\nExemplo: *${ctx.prefix}enquete Qual fruta você prefere? | Maçã | Banana | Uva*`,
                "bot"
            );
        }

        const partes = entrada
            .split(/\s*[|;]\s*/)
            .map(limparTexto)
            .filter(Boolean);
        const pergunta = partes.shift() || "";
        const opcoes = removerDuplicadas(partes);

        if (!pergunta || pergunta.length > LIMITE_PERGUNTA) {
            return replyNYX(ctx, `❌ A pergunta deve ter entre 1 e ${LIMITE_PERGUNTA} caracteres.`, "bot");
        }

        if (opcoes.length < 2) {
            return replyNYX(ctx, `❌ Informe pelo menos duas opções separadas por *|*.\nExemplo: *${ctx.prefix}enquete Café ou chá? | Café | Chá*`, "bot");
        }

        if (opcoes.length > MAX_OPCOES) {
            return replyNYX(ctx, `❌ A enquete pode ter no máximo ${MAX_OPCOES} opções.`, "bot");
        }

        if (opcoes.some((opcao) => opcao.length > LIMITE_OPCAO)) {
            return replyNYX(ctx, `❌ Cada opção deve ter no máximo ${LIMITE_OPCAO} caracteres.`, "bot");
        }

        const enquete = {
            poll: {
                name: fonteNYX(pergunta),
                values: opcoes.map((opcao) => fonteNYX(opcao)),
                selectableCount: 1
            }
        };

        try { await ctx.react("📊"); } catch (e) {}

        try {
            return await ctx.sock.sendMessage(
                ctx.chat,
                enquete,
                { quoted: ctx.message }
            );
        } catch (error) {
            console.error("[ENQUETE] Erro:", error.message);
            return replyNYX(ctx, "❌ Não consegui criar essa enquete agora. Tente novamente.", "bot");
        }
    }
};
