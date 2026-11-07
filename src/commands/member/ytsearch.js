const { execFile } = require("child_process");
const { promisify } = require("util");
const replyNYX = require("../../utils/replyNYX");
const { proto, generateWAMessageFromContent } = require("@whiskeysockets/baileys");

const execFileAsync = promisify(execFile);

function criarBizNode() {
    return {
        tag: "biz",
        attrs: {
            actual_actors: "2",
            host_storage: "2",
            privacy_mode_ts: (Math.floor(Date.now() / 1000) - 77980457).toString()
        },
        content: [
            { tag: "interactive", attrs: { type: "native_flow", v: "1" }, content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }] },
            { tag: "quality_control", attrs: { source_type: "third_party" } }
        ]
    };
}

module.exports = {
    name: ["ytsearch", "buscar"],
    description: "Pesquisa vídeos no YouTube e retorna uma lista",
    execute: async (ctx) => {
        const busca = ctx.args.join(" ").trim();
        if (!busca) {
            return replyNYX(ctx, `🔍 *PESQUISAR NO YOUTUBE*\n\nUso: ${ctx.prefix}ytsearch [nome do vídeo]`, "bot");
        }

        try { await ctx.react("🔍"); } catch (e) {}
        await ctx.reply("🔍 Pesquisando no YouTube, aguarde...");

        try {
            // Pega os 5 primeiros resultados
            const { stdout } = await execFileAsync("yt-dlp", [
                `ytsearch5:${busca}`,
                "--dump-json",
                "--flat-playlist",
                "--no-warnings"
            ], { timeout: 60000, maxBuffer: 10 * 1024 * 1024 });

            const linhas = stdout.trim().split("\n").filter(Boolean);
            if (linhas.length === 0) return replyNYX(ctx, "❌ Nenhum vídeo encontrado.", "bot");

            const rows = [];

            for (let i = 0; i < linhas.length; i++) {
                const video = JSON.parse(linhas[i]);
                const title = video.title || "Desconhecido";
                const url = video.webpage_url || video.url;
                const duration = video.duration_string || (video.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : "N/A");

                rows.push({
                    title: `${i + 1}. ${title.substring(0, 30)}...`, // Corta título longo
                    description: `Duração: ${duration}`,
                    id: `ytsearch_audio|${url}` // ID que o handler vai interceptar
                });
            }

            const botaoLista = proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Escolha a música",
                    sections: [
                        {
                            title: `Resultados para: ${busca.substring(0, 20)}`,
                            rows: rows
                        }
                    ]
                })
            });

            const interactiveMessage = proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                    text: `🔍 *Resultados encontrados*\nClique no botão abaixo para escolher qual baixar:`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: "v23.5.0 | Escolha um resultado"
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [botaoLista],
                    messageParamsJson: "",
                    messageVersion: 1
                })
            });

            const msg = generateWAMessageFromContent(
                ctx.chat,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage
                        }
                    }
                },
                { userJid: ctx.sock.user.id }
            );

            const additionalNodes = [criarBizNode()];
            if (!ctx.chat.endsWith("@g.us")) {
                additionalNodes.unshift({ tag: "bot", attrs: { biz_bot: "1" } });
            }

            await ctx.sock.relayMessage(
                ctx.chat,
                msg.message,
                {
                    messageId: msg.key.id,
                    additionalNodes
                }
            );

        } catch (error) {
            console.error("[YTSEARCH] Erro:", error.message);
            await replyNYX(ctx, "❌ Erro ao pesquisar. Tente novamente.", "bot");
        }
    }
};