const axios = require("axios");
const sharp = require("sharp");
const replyNYX = require("../../utils/replyNYX");
const sendNYXMedia = require("../../utils/sendNYXMedia");

const NEXRAY_BASE = "https://api.nexray.web.id";
const MAX_TEXT_LENGTH = 180;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;

function getErrorMessage(data) {
    if (!data) return "Resposta vazia da API.";
    if (typeof data === "string") return data.slice(0, 240);
    return data.error || data.message || "A API recusou a solicitação.";
}

module.exports = {
    name: ["nexraybrat"],
    description: "Cria uma figurinha Brat usando a NexRay API",

    execute: async ctx => {
        const texto = ctx.args.join(" ").trim();

        if (!texto) {
            return replyNYX(
                ctx,
                `🖼️ Informe o texto da figurinha.\n\nUso: ${ctx.prefix}nexraybrat seu texto aqui`,
                "bot"
            );
        }

        if (texto.length > MAX_TEXT_LENGTH) {
            return replyNYX(
                ctx,
                `❌ O texto deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`,
                "bot"
            );
        }

        try {
            await ctx.react("🖼️");
            await ctx.reply("🖼️ Criando sua figurinha pela NexRay, aguarde...");

            const response = await axios.get(`${NEXRAY_BASE}/maker/brat`, {
                params: { text: texto },
                responseType: "arraybuffer",
                timeout: 20000,
                maxContentLength: MAX_RESPONSE_BYTES,
                maxBodyLength: MAX_RESPONSE_BYTES,
                validateStatus: () => true,
                headers: {
                    Accept: "image/png, application/json",
                    "User-Agent": "runner-bot-nexray/1.0"
                }
            });

            const contentType = String(response.headers["content-type"] || "").toLowerCase();
            const body = Buffer.from(response.data || []);

            if (response.status < 200 || response.status >= 300) {
                let data = null;
                try {
                    data = JSON.parse(body.toString("utf8"));
                } catch (error) {
                    // A resposta pode ser texto simples ou HTML de erro.
                }
                throw new Error(`HTTP ${response.status}: ${getErrorMessage(data || body.toString("utf8"))}`);
            }

            if (!contentType.startsWith("image/") || body.length === 0) {
                let data = null;
                try {
                    data = JSON.parse(body.toString("utf8"));
                } catch (error) {
                    // Mantém a mensagem genérica abaixo.
                }
                throw new Error(getErrorMessage(data || body.toString("utf8")));
            }

            const sticker = await sharp(body)
                .resize(512, 512, {
                    fit: "contain",
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .webp({ quality: 82 })
                .toBuffer();

            return sendNYXMedia(ctx.sock, ctx.chat, { sticker }, ctx.message);
        } catch (error) {
            console.error("[NEXRAYBRAT] Erro:", error.message);
            return replyNYX(
                ctx,
                "❌ Não consegui gerar a figurinha agora. A NexRay pode estar indisponível; tente novamente mais tarde.",
                "bot"
            );
        }
    }
};