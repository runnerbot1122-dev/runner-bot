const {
    getUser,
    updateActivity,
    updateIdentity,
    registrarMensagem
} = require("../utils/users");

const config = require("../config/config");
const comandos = require("./loader");
const { getPermissions, isMaster } = require("../utils/permissions");
const { criarGrupo, getSetting } = require("../utils/groups");
const { executarEventos } = require("../events");
const sendCategoriesMenu = require("../utils/sendCategoriesMenu");
const executarComando = require("./commandRunner");
const { estaMutado, desmutar } = require("../utils/mutes");
const { podePunir } = require("../utils/checkTarget");
const replyNYX = require("../utils/replyNYX");
const sendNYX = require("../utils/sendNYX");
const { obterIdentidadeMensagem } = require("../utils/messageIdentity");
const { ganharXP } = require("../utils/xp");
const database = require("../database/database");
const { applyAutomaticKeywordReactions, applyPrefixReaction } = require("./reactionManager");
const { applyAutomaticReplies } = require("./autoReplyManager");
const security = require("../database/securityGroups");
const { deletePaymentMessageWithFallback } = require("../utils/deletePaymentMessage");
const { processarAutomacoes } = require("./automationManager");
const { isDDDBloqueado } = require("../utils/ddd");
const soadm = require("../utils/soadm");

function desembrulharConteudo(mensagem) {
    let atual = mensagem || {};
    for (let i = 0; i < 6; i++) {
        const interno = atual.ephemeralMessage?.message || atual.viewOnceMessage?.message ||
            atual.viewOnceMessageV2?.message || atual.viewOnceMessageV2Extension?.message ||
            atual.documentWithCaptionMessage?.message || atual.editedMessage?.message;
        if (!interno) break;
        atual = interno;
    }
    return atual;
}

function obterFigurinhaMensagem(mensagem) {
    const atual = desembrulharConteudo(mensagem);
    return atual.stickerMessage || atual.audioStickerMessage?.message?.stickerMessage || null;
}

const spamCache = new Map();
const cooldownCache = new Map();
const floodCache = new Map();

async function handler(sock, m, opcoes = {}) {
    try {
        if (!m.message) return;
        if (m.key.fromMe) return;

        const chat = m.key.remoteJid;

        // 👁️ X9 VISUALIZAÇÃO ÚNICA
        if (chat.endsWith("@g.us")) {
            const { getSetting: getSettingX9 } = require("../utils/groups");
            if (getSettingX9(chat, "x9VisuUnica") === true) {
                const viewOnce =
                    m.message?.viewOnceMessage?.message ||
                    m.message?.viewOnceMessageV2?.message ||
                    m.message?.viewOnceMessageV2Extension?.message;
                if (viewOnce) {
                    try {
                        const { downloadMediaMessage } = require("@whiskeysockets/baileys");
                        const buffer = await downloadMediaMessage(
                            { message: viewOnce, key: m.key },
                            "buffer",
                            {},
                            { logger: console, reuploadRequest: sock.updateMediaMessage }
                        );
                        let payload = { document: buffer, mimetype: "application/octet-stream", fileName: "viewonce" };
                        if (viewOnce.imageMessage) payload = { image: buffer, caption: "👁️ *X9 Visualização Única*" };
                        else if (viewOnce.videoMessage) payload = { video: buffer, caption: "👁️ *X9 Visualização Única*" };
                        else if (viewOnce.audioMessage) payload = { audio: buffer, mimetype: "audio/mp4" };
                        await sock.sendMessage(chat, payload, { quoted: m });
                    } catch (e) {
                        console.log("[x9visuunica] Falha ao capturar mídia:", e.message);
                    }
                }
            }
        }

        // =========================================
        // INTERCEPTADOR DE PEDIDOS DE NAMORO (SIM/NÃO)
        // =========================================
        const textoBruto = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (textoBruto) {
            const textLower = textoBruto.trim().toLowerCase();
            const isSim = ["sim", "aceito", "quero", "s"].includes(textLower);
            const isNao = ["não", "nao", "recuso", "n"].includes(textLower);

            if (isSim || isNao) {
                const familyDb = require("../database/families");
                const pedido = familyDb.getPendingProposal(m.key.participant || m.key.remoteJid);

                if (pedido) {
                    const prefixoPrincipal = chat.endsWith("@g.us") ? getSetting(chat, "prefix") || config.prefix : config.prefix;

                    if (isSim) {
                        familyDb.acceptProposal(pedido.id);
                        const textoAceite =
`╔═━✰『 💍 ɴᴏᴠᴏ ᴄᴀsᴀʟ 』═━✰

║╎⊹ ࣪ ˖ 🎉 ▸ WOWN! O pedido foi aceito!
║╎⊹ ࣪ ˖ 💖 ▸ @${pedido.from.split("@")[0]} + @${pedido.to.split("@")[0]}
║╎⊹ ࣪ ˖ 📜 ▸ _Parabéns aos pombinhos!_

║╎⊹ ࣪ ˖ ℹ️ ▸ Use *${prefixoPrincipal}minhadupla* para ver os detalhes.

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

                        await replyNYX({ sock, chat, message: m, sender: m.key.participant || m.key.remoteJid },
                            { text: textoAceite, mentions: [pedido.from, pedido.to] },
                            "bot"
                        );
                        return;
                    } else {
                        familyDb.rejectProposal(pedido.id);
                        const textoRecusa =
`╔═━✰『 💔 ᴘᴇᴅɪᴅᴏ ʀᴇᴄᴜsᴀᴅᴏ 』═━✰

║╎⊹ ࣪ ˖ 😔 ▸ Que pena...
║╎⊹ ࣪ ˖ 🥀 ▸ @${pedido.to.split("@")[0]} recusou o pedido de @${pedido.from.split("@")[0]}.
║╎⊹ ࣪ ˖ 💭 ▸ _Tente com outro alguém!_

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

                        await replyNYX({ sock, chat, message: m, sender: m.key.participant || m.key.remoteJid },
                            { text: textoRecusa, mentions: [pedido.from, pedido.to] },
                            "bot"
                        );
                        return;
                    }
                }
            }
        }

        // =========================================
        // INTERCEPTADOR DE JOGOS
        // =========================================
        const identidade = obterIdentidadeMensagem(m);
        const remetente = identidade.remetente;

        if (textoBruto && chat.endsWith("@g.us")) {
            const gameManager = require("./gameManager");

            // --- 1. JOGO DA VELHA (PvP) ---
            const jogoVelha = gameManager.getJogoAtivoNoGrupo(chat, "jogodavelha");
            if (jogoVelha) {
                const jogo = jogoVelha.dados;
                const jogada = parseInt(textoBruto.trim());

                if (!isNaN(jogada) && jogada >= 1 && jogada <= 9) {
                    const index = jogada - 1;

                    const isJogador1 = remetente === jogo.jogador1;
                    const isJogador2 = remetente === jogo.jogador2;

                    if (!isJogador1 && !isJogador2) return;

                    if (remetente !== jogo.turno) {
                        await replyNYX({ sock, chat, message: m, sender: remetente }, `⏳ Calma! Não é a sua vez ainda.`, "bot");
                        return;
                    }

                    if (jogo.board[index] !== "") {
                        await replyNYX({ sock, chat, message: m, sender: remetente }, `⚠️ Essa posição já está ocupada! Escolha outra.`, "bot");
                        return;
                    }

                    const cmdVelha = require("../commands/member/jogodavelha");
                    const { renderBoard, checkWin } = cmdVelha;

                    const simbolo = isJogador1 ? "X" : "O";
                    jogo.board[index] = simbolo;

                    if (checkWin(jogo.board, simbolo)) {
                        gameManager.encerrarJogo(chat, jogo.jogador1);
                        const textoVitoria = `🏆 *VITÓRIA!*\n\n@${remetente.split("@")[0]} (${simbolo === 'X' ? '❌' : '⭕'}) ganhou o jogo!\n\n${renderBoard(jogo.board)}`;
                        await replyNYX({ sock, chat, message: m, sender: remetente },
                            { text: textoVitoria, mentions: [remetente] }, "bot");
                        return;
                    }

                    if (!jogo.board.includes("")) {
                        gameManager.encerrarJogo(chat, jogo.jogador1);
                        await replyNYX({ sock, chat, message: m, sender: remetente }, `🤝 *DEU VELHA (EMPATE)!*\n\n${renderBoard(jogo.board)}`, "bot");
                        return;
                    }

                    jogo.turno = isJogador1 ? jogo.jogador2 : jogo.jogador1;

                    const simboloProximo = isJogador1 ? "⭕" : "❌";
                    const textoTurno = `${renderBoard(jogo.board)}\n🎮 É a vez de @${jogo.turno.split("@")[0]} (${simboloProximo}). Digite um número.`;

                    await replyNYX({ sock, chat, message: m, sender: remetente },
                        { text: textoTurno, mentions: [jogo.turno] }, "bot");
                    return;
                }
            }

            // --- 2. OUTROS JOGOS (Quiz, Adivinha, Forca) ---
            const jogoAtivo = gameManager.getJogo(chat, remetente);
            if (jogoAtivo) {
                if (Date.now() - (jogoAtivo.ultimaInteracao || 0) < 1500) {
                    return;
                }
                gameManager.atualizarInteracao(chat, remetente);

                const respostaUsuario = textoBruto.trim().toLowerCase();

                if (jogoAtivo.tipo === "quiz" || jogoAtivo.tipo === "adivinha") {
                    if (respostaUsuario === jogoAtivo.dados.resposta.toLowerCase()) {
                        gameManager.encerrarJogo(chat, remetente);
                        await replyNYX({ sock, chat, message: m, sender: remetente }, `✅ *ACERTOU!*\n\nA resposta era *${jogoAtivo.dados.resposta}*.`, "bot");
                    } else {
                        gameManager.encerrarJogo(chat, remetente);
                        await replyNYX({ sock, chat, message: m, sender: remetente }, `❌ *ERROU!*\n\nA resposta certa era *${jogoAtivo.dados.resposta}*.`, "bot");
                    }
                    return;
                }

                if (jogoAtivo.tipo === "forca") {
                    const letra = respostaUsuario[0].toUpperCase();
                    const jogo = jogoAtivo.dados;

                    if (jogo.letrasChutadas.includes(letra)) {
                        await replyNYX({ sock, chat, message: m, sender: remetente }, `⚠️ Você já tentou a letra *${letra}*!`, "bot");
                        return;
                    }

                    jogo.letrasChutadas.push(letra);
                    const tabuleiro = jogo.palavra.split("").map(l => jogo.letrasChutadas.includes(l) ? l : "_").join(" ");

                    if (jogo.palavra.includes(letra)) {
                        const venceu = jogo.palavra.split("").every(l => jogo.letrasChutadas.includes(l));

                        if (venceu) {
                            gameManager.encerrarJogo(chat, remetente);
                            await replyNYX({ sock, chat, message: m, sender: remetente }, `🏆 *PARABÉNS!*\n\nVocê descobriu a palavra: *${jogo.palavra}*`, "bot");
                        } else {
                            await replyNYX({ sock, chat, message: m, sender: remetente }, `✅ Acertou a letra *${letra}*!\n\nPALAVRA: ${tabuleiro}\n❤️ Vidas: ${jogo.vidas}\n\nTente outra letra.`, "bot");
                        }
                    } else {
                        jogo.vidas--;

                        if (jogo.vidas <= 0) {
                            gameManager.encerrarJogo(chat, remetente);
                            await replyNYX({ sock, chat, message: m, sender: remetente }, `💀 *VOCÊ PERDEU!*\n\nA palavra era: *${jogo.palavra}*\n\nSuas vidas acabaram.`, "bot");
                        } else {
                            await replyNYX({ sock, chat, message: m, sender: remetente }, `❌ A letra *${letra}* não existe.\n\nPALAVRA: ${tabuleiro}\n❤️ Vidas: ${jogo.vidas}\n\nTente outra letra.`, "bot");
                        }
                    }
                    return;
                }
            }
        }

        const buttonId = m.message.buttonsResponseMessage?.selectedButtonId || null;
        const templateButtonId = m.message.templateButtonReplyMessage?.selectedId || null;
        const nativeButtonId = buttonId || templateButtonId;

        // Dependendo do cliente WhatsApp, quick_reply pode chegar como botão
        // comum/template em vez de interactiveResponseMessage.
        let interactiveButtonId = nativeButtonId;

        if (nativeButtonId && nativeButtonId.startsWith("copiar_")) {
            const linkCopiado = nativeButtonId.replace("copiar_", "");
            await replyNYX({ sock, chat, message: m, sender: remetente }, `📋 *Link para copiar:*\n\n${linkCopiado}`, "bot");
            return;
        }

        if (nativeButtonId === "delete_link") {
            const mensagemOriginal = m.message.templateButtonReplyMessage?.contextInfo?.stanzaId;
            if (mensagemOriginal) {
                await sock.sendMessage(chat, {
                    delete: { remoteJid: chat, fromMe: true, id: mensagemOriginal, participant: sock.user.id }
                });
            }
            return;
        }

        if (chat.endsWith("@g.us")) criarGrupo(chat);

        let texto = m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            m.message.imageMessage?.caption ||
            m.message.videoMessage?.caption ||
            "";

        let interactiveId = null;

        const paramsJson = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        if (paramsJson) {
            try {
                const params = JSON.parse(paramsJson);
                interactiveId = params.id || params.selectedId || params.button_id || null;
            } catch (erro) { console.log("Erro ao ler resposta do menu:", erro.message); }
        }

        if (m.message.listResponseMessage?.singleSelectReply?.selectedRowId) {
            interactiveId = m.message.listResponseMessage.singleSelectReply.selectedRowId;
        }

        if (!interactiveId && interactiveButtonId) {
            interactiveId = interactiveButtonId;
        }

        if (interactiveId && interactiveId.startsWith("ytsearch_audio|")) {
            const urlVideo = interactiveId.split("|")[1];
            await sock.sendMessage(chat, { text: "🎵 Baixando seu áudio, aguarde..." }, { quoted: m });
            try {
                const { buscarEBaixarAudio } = require("../utils/youtubeAudio");
                const faixa = await buscarEBaixarAudio(urlVideo);
                if (faixa && faixa.audioBuffer) {
                    await sock.sendMessage(chat, {
                        audio: faixa.audioBuffer,
                        mimetype: "audio/mpeg",
                        ptt: false,
                        fileName: `${faixa.title.replace(/[\\/:*?"<>|]/g, '_')}.mp3`
                    }, { quoted: m });
                } else {
                    throw new Error("Áudio não encontrado.");
                }
            } catch (err) {
                console.error("[YTSEARCH DOWNLOAD] Erro:", err.message);
                await sock.sendMessage(chat, { text: "❌ Erro ao baixar o áudio. Tente novamente." }, { quoted: m });
            }
            return;
        }

        texto = texto.trim();

        const permissoes = await getPermissions(sock, chat, remetente, [identidade.jid, identidade.lid]);
        const isAdmin = permissoes.admin || permissoes.owner;

        if (chat.endsWith("@g.us") && soadm.status(chat) && !isAdmin) {
            const prefixoPrincipal = getSetting(chat, "prefix") || config.prefix;
            const extras = getSetting(chat, "extrasPrefixos") || [];
            const todosPrefixos = [prefixoPrincipal, ...extras];
            const tentouComando = todosPrefixos.some(p => texto.startsWith(p));

            if (tentouComando || buttonId || interactiveId) {
                await replyNYX({ sock, chat, message: m, sender: remetente },
                    `🔒 *SÓ ADMIN ATIVADO*\n\n@${remetente.split("@")[0]}, apenas administradores podem usar os comandos do bot agora.`,
                    "bot", [remetente]
                );
            }
            return;
        }

        // =========================================================
        // CORREÇÃO AQUI: Adicionado o '&& !isAdmin' para os admins não serem punidos
        // =========================================================
        if (chat.endsWith("@g.us") && !isAdmin) {
            const protecoes = {
                antiImg: getSetting(chat, "antiImg") === true,
                antiVideo: getSetting(chat, "antiVideo") === true,
                antiAudio: getSetting(chat, "antiAudio") === true,
                antiSticker: getSetting(chat, "antiSticker") === true,
                antiDoc: getSetting(chat, "antiDoc") === true || getSetting(chat, "antiDocumento") === true,
                antiContato: getSetting(chat, "antiContato") === true,
                antiCatalogo: getSetting(chat, "antiCatalogo") === true,
                antiTrava: getSetting(chat, "antiTrava") === true,
                antiFake: getSetting(chat, "antiFake") === true,
                antiPay: getSetting(chat, "antiPay") === true,
                antiPalavra: getSetting(chat, "antiPalavra") === true,
                antiDdd: getSetting(chat, "antiDdd") === true,
                antiStatus: getSetting(chat, "antiStatus") === true,
                antiLigacao: getSetting(chat, "antiLigacao") === true,
                antiNotas: getSetting(chat, "antiNotas") === true
            };

            let infracao = null;
            const isStatusMention = Boolean(m.message.groupStatusMentionMessage || m.message.messageContextInfo?.groupStatusMentionMessage);
            const isCallLog = Boolean(m.message.call || m.message.callLogMesssage || m.message.callMessage);

            if (protecoes.antiStatus && isStatusMention) infracao = "Status de Grupo";

            if (protecoes.antiLigacao && isCallLog) {
                infracao = "Ligação no Grupo";
                try {
                    const autorLigacao = m.key.participant || m.key.remoteJid;
                    const callId = m.message.call?.callKey;
                    if (callId) await sock.rejectCall(callId, autorLigacao);
                    await replyNYX({ sock, chat, message: m, sender: remetente }, `🚫 *ANTI-LIGAÇÃO ATIVADO*\n\nAs chamadas estão desativadas neste grupo.`, "bot");
                } catch (e) { console.log("[ANTI-LIGACAO] Erro:", e.message); }
                return;
            }

            if (protecoes.antiNotas && !infracao) {
                if (m.message.notesMessage || m.message.extendedTextMessage?.contextInfo?.isNote) {
                    infracao = "Nota no Grupo";
                }
            }

            if (!infracao && m.message.imageMessage && protecoes.antiImg) infracao = "Imagem";
            else if (!infracao && m.message.videoMessage && protecoes.antiVideo) infracao = "Vídeo";
            else if (!infracao && m.message.audioMessage && protecoes.antiAudio) infracao = "Áudio";
            else if (!infracao && obterFigurinhaMensagem(m.message) && protecoes.antiSticker) infracao = "Figurinha";
            else if (!infracao && m.message.documentMessage && protecoes.antiDoc) infracao = "Documento";
            else if (!infracao && m.message.requestPaymentMessage && protecoes.antiPay) infracao = "Pedido de Pagamento";
            else if (!infracao && m.message.contactMessage && protecoes.antiContato) infracao = "Contato";
            else if (!infracao && m.message.productMessage && protecoes.antiCatalogo) infracao = "Catálogo";

            if (!infracao && texto) {
                const textoLower = texto.toLowerCase();
                if (protecoes.antiTrava && (texto.length > 5000 || /[\u200B-\u200D\uFEFF]{10,}/.test(texto))) infracao = "Trava (Texto Suspeito)";
                const limiteChar = getSetting(chat, "limiteCaracteres");
                if (!infracao && limiteChar && limiteChar > 0 && texto.length > limiteChar) infracao = `Texto muito longo (${texto.length}/${limiteChar})`;
                if (protecoes.antiPalavra) {
                    const palavrasProibidas = ["caralho", "porra", "merda", "foder", "puta", "viado", "arrombado", "desgraçado"];
                    if (palavrasProibidas.some(p => textoLower.includes(p))) infracao = "Palavrão";
                }
                if (protecoes.antiPay && (textoLower.includes("pix") || textoLower.includes("pagamento") || textoLower.includes("transferência") || textoLower.includes("copiar chave"))) {
                    if (!isAdmin) infracao = "Pedido de Pagamento";
                }
            }

            if (!infracao && protecoes.antiDdd && isDDDBloqueado(chat, remetente)) infracao = "Número com DDD Bloqueado";
            if (!infracao && protecoes.antiFake && remetente.endsWith("@s.whatsapp.net")) {
                const numero = remetente.split("@")[0];
                if (!numero.startsWith("55") || numero.length < 10) infracao = "Número Fake/Estrangeiro";
            }

            if (infracao) {
                try {
                    if (m.message.requestPaymentMessage) {
                        await deletePaymentMessageWithFallback({
                            socket: sock, remoteJid: chat,
                            messageKey: { remoteJid: chat, fromMe: false, id: m.key.id, participant: remetente }
                        });
                    } else {
                        await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: m.key.id, participant: remetente } });
                    }
                    await replyNYX({ sock, chat, message: m, sender: remetente }, `🚫 *PROTEÇÃO ATIVADA*\n\nO envio de *${infracao}* não é permitido neste grupo.`, "bot");
                } catch (e) { console.log(`Erro ao aplicar proteção de ${infracao}:`, e.message); }
                return;
            }
        }

        if (chat.endsWith("@g.us") && texto && !isAdmin) {
            const textoLower = texto.toLowerCase();
            const agora = Date.now();

            const obterDadosUsuario = async (jidOriginal) => {
                let jidFinal = jidOriginal;
                let nome = jidOriginal.split("@")[0];
                try {
                    const busca = await sock.onWhatsApp(jidOriginal);
                    if (busca && busca.length > 0 && busca[0].exists) jidFinal = busca[0].jid;
                } catch (e) {}
                const podeMarcar = !jidFinal.endsWith("@lid");
                try {
                    const metadata = await sock.groupMetadata(chat);
                    const participante = metadata.participants.find(p => p.id === jidOriginal);
                    if (participante) nome = participante.notify || participante.name || nome;
                } catch (e) {}
                return { jid: jidFinal, nome, podeMarcar };
            };

            const antiSpamAtivo = getSetting(chat, "antiSpam") === true;
            if (antiSpamAtivo) {
                const chaveSpam = `${chat}_${remetente}`;
                if (!spamCache.has(chaveSpam)) {
                    spamCache.set(chaveSpam, { texto: textoLower, tempo: agora, contador: 1, avisou: false });
                } else {
                    const dados = spamCache.get(chaveSpam);
                    if (dados.texto === textoLower && (agora - dados.tempo) < 4000) {
                        dados.contador++;
                        dados.tempo = agora;
                        if (dados.contador === 3 && !dados.avisou) {
                            dados.avisou = true;
                            const user = await obterDadosUsuario(remetente);
                            await replyNYX({ sock, chat, message: m, sender: remetente }, user.podeMarcar ? `⚠️ *AVISO*\n\n@${user.jid.split("@")[0]}, evite spam ou você será removido do grupo.` : `⚠️ *AVISO*\n\n${user.nome}, evite spam ou você será removido do grupo.`, "bot", user.podeMarcar ? [user.jid] : []);
                        }
                        if (dados.contador >= 5) {
                            spamCache.delete(chaveSpam);
                            const user = await obterDadosUsuario(remetente);
                            try { await sock.groupParticipantsUpdate(chat, [user.jid], "remove"); } catch(e) {}
                            await replyNYX({ sock, chat, message: m, sender: remetente }, user.podeMarcar ? `🚫 *MEMBRO REMOVIDO*\n\n@${user.jid.split("@")[0]} foi removido por SPAM.` : `🚫 *MEMBRO REMOVIDO*\n\n${user.nome} foi removido por SPAM.`, "bot", user.podeMarcar ? [user.jid] : []);
                            return;
                        }
                    } else {
                        spamCache.set(chaveSpam, { texto: textoLower, tempo: agora, contador: 1, avisou: false });
                    }
                }
            }

            const antiFloodAtivo = getSetting(chat, "antiFlood") === true;
            if (antiFloodAtivo) {
                const chaveFlood = `${chat}_flood_${remetente}`;
                if (!floodCache.has(chaveFlood)) {
                    floodCache.set(chaveFlood, { tempoInicio: agora, contador: 1, avisou: false });
                } else {
                    const dados = floodCache.get(chaveFlood);
                    if ((agora - dados.tempoInicio) < 6000) {
                        dados.contador++;
                        if (dados.contador === 8 && !dados.avisou) {
                            dados.avisou = true;
                            const user = await obterDadosUsuario(remetente);
                            await replyNYX({ sock, chat, message: m, sender: remetente }, user.podeMarcar ? `⚠️ *AVISO*\n\n@${user.jid.split("@")[0]}, evite flood ou você será removido do grupo.` : `⚠️ *AVISO*\n\n${user.nome}, evite flood ou você será removido do grupo.`, "bot", user.podeMarcar ? [user.jid] : []);
                        }
                        if (dados.contador >= 12) {
                            floodCache.delete(chaveFlood);
                            const user = await obterDadosUsuario(remetente);
                            try { await sock.groupParticipantsUpdate(chat, [user.jid], "remove"); } catch(e) {}
                            await replyNYX({ sock, chat, message: m, sender: remetente }, user.podeMarcar ? `🚫 *MEMBRO REMOVIDO*\n\n@${user.jid.split("@")[0]} foi removido por FLOOD.` : `🚫 *MEMBRO REMOVIDO*\n\n${user.nome} foi removido por FLOOD.`, "bot", user.podeMarcar ? [user.jid] : []);
                            return;
                        }
                    } else {
                        floodCache.set(chaveFlood, { tempoInicio: agora, contador: 1, avisou: false });
                    }
                }
            }
        }

        if (chat.endsWith("@g.us")) {
            try {
                const prefixoParaAuto = getSetting(chat, "prefix") || config.prefix;
                await processarAutomacoes({ sock, m, chat, remetente, texto, isAdmin, prefixoAtual: prefixoParaAuto });
            } catch (error) { console.error("[automacoes] Falha ao processar automações:", error.message); }
        }

        if (chat.endsWith("@g.us") && m.key.id) {
            const messageStore = require("../database/messageStore");
            const { downloadMediaMessage } = require("@whiskeysockets/baileys");
            let msgParaSalvar = m.message;
            if (msgParaSalvar.viewOnceMessageV2) msgParaSalvar = msgParaSalvar.viewOnceMessageV2.message;
            else if (msgParaSalvar.viewOnceMessageV2Extension) msgParaSalvar = msgParaSalvar.viewOnceMessageV2Extension.message;

            const textoCache = msgParaSalvar?.conversation || msgParaSalvar?.extendedTextMessage?.text || msgParaSalvar?.imageMessage?.caption || msgParaSalvar?.videoMessage?.caption || "";
            const paraSalvar = { text: textoCache || "[Mídia]", sender: m.key.participant || m.key.remoteJid, timestamp: Date.now(), mediaBuffer: null, mediaType: null };

            if (msgParaSalvar.imageMessage) paraSalvar.mediaType = "image";
            else if (msgParaSalvar.videoMessage) paraSalvar.mediaType = "video";
            else if (msgParaSalvar.audioMessage) paraSalvar.mediaType = "audio";

            if (paraSalvar.mediaType) {
                try {
                    paraSalvar.mediaBuffer = await downloadMediaMessage({ message: msgParaSalvar }, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage });
                } catch (e) { console.log("Não foi possível baixar mídia para o cache:", e.message); }
            }
            messageStore.save(m.key.id, paraSalvar);
        }

        const menusNativos = ["menudono", "menuadm", "menuia", "menudownload", "menubrincadeiras", "menuprincipal", "status", "criador"];
        const prefixoPrincipal = chat.endsWith("@g.us") ? getSetting(chat, "prefix") || config.prefix : config.prefix;
        const extras = chat.endsWith("@g.us") ? (getSetting(chat, "extrasPrefixos") || []) : [];
        const todosPrefixos = [prefixoPrincipal, ...extras];

        let prefixoUsado = null;
        for (const p of todosPrefixos) {
            if (texto.startsWith(p)) {
                prefixoUsado = p;
                break;
            }
        }

        if (interactiveId && menusNativos.includes(interactiveId)) {
            texto = `${prefixoPrincipal}${interactiveId}`;
            prefixoUsado = prefixoPrincipal;
        }

        if (interactiveId && /^play_(?:document|audio|video)\|/i.test(interactiveId)) {
            const separador = interactiveId.indexOf("|");
            const tipo = interactiveId.slice(5, separador).toLowerCase();
            const urlCodificada = interactiveId.slice(separador + 1);
            texto = `${prefixoPrincipal}play_opcao_interno ${tipo} ${urlCodificada}`;
            prefixoUsado = prefixoPrincipal;
        }

        const isStatusMentionForReturn = Boolean(m.message.groupStatusMentionMessage || m.message.messageContextInfo?.groupStatusMentionMessage);
        const isCallLogForReturn = Boolean(m.message.call || m.message.callLogMesssage || m.message.callMessage);

        if (!texto && !buttonId && !isStatusMentionForReturn && !isCallLogForReturn) return;

        const { logMensagem } = require("../utils/logs");
        const mensagemConteudo = desembrulharConteudo(m.message);
        const tipoMensagem = mensagemConteudo.imageMessage ? "Imagem" : mensagemConteudo.videoMessage ? "Vídeo" : mensagemConteudo.audioMessage ? "Áudio" : obterFigurinhaMensagem(m.message) ? "Figurinha" : mensagemConteudo.documentMessage ? "Documento" : (buttonId || templateButtonId) ? "Botão" : "Texto";
        logMensagem({ usuario: m.pushName || "Desconhecido", remetente: remetente.split("@")[0], chat: chat.endsWith("@g.us") ? "Grupo" : "Privado", tipo: tipoMensagem, conteudo: "[conteúdo omitido por privacidade]" });

        const lid = identidade.lid;
        const jid = identidade.jid;

        const testeMute = estaMutado(chat, remetente);
        if (testeMute && chat.endsWith("@g.us")) {
            try { await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: m.key.id, participant: remetente } }); }
            catch (error) { console.log("Não foi possível apagar mensagem de usuário mutado:", error.message); }
            return;
        }

        updateIdentity(jid, lid);
        if (m.pushName && remetente) getUser(remetente, m.pushName);

        if (!permissoes.owner) {
            try {
                const bloqueios = require("../database/blockRules");
                if (bloqueios.isUserBlocked(remetente)) return;
                if (chat.endsWith("@g.us") && bloqueios.isGroupBlocked(chat)) return;
            } catch (error) { console.error("Falha ao verificar bloqueios de usuário/grupo:", error.message); return; }
        }

        const botOff = chat.endsWith("@g.us") ? getSetting(chat, "botOff") : false;
        if (botOff && !permissoes.owner) { console.log("Bot desligado neste grupo."); return; }

        if (!prefixoUsado) {
            const txtLimpo = texto.trim().toLowerCase();
            if (txtLimpo === "fig" && (mensagemConteudo.imageMessage || mensagemConteudo.videoMessage || mensagemConteudo.audioMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage || obterFigurinhaMensagem(m.message.extendedTextMessage?.contextInfo?.quotedMessage))) {
                texto = `${prefixoPrincipal}fig`;
                prefixoUsado = prefixoPrincipal;
            }
            if ((txtLimpo === "tk" || txtLimpo === "take") && obterFigurinhaMensagem(m.message.extendedTextMessage?.contextInfo?.quotedMessage)) {
                texto = `${prefixoPrincipal}tk`;
                prefixoUsado = prefixoPrincipal;
            }
            if (txtLimpo === "l" || txtLimpo === "link") {
                texto = `${prefixoPrincipal}link`;
                prefixoUsado = prefixoPrincipal;
            }
        }

        const mensagemInterna = Boolean(buttonId || interactiveId);
        const atalhoSemPrefixo = /^(?:a|f|t(?:\s|$)|[sx]\d*|fig|tk|take|l|link)$/i.test(texto.trim());
        const ehComando = Boolean(prefixoUsado) || atalhoSemPrefixo;

        if (!mensagemInterna && chat.endsWith("@g.us")) {
            database.beginUsersBatch();
            try {
                registrarMensagem(remetente, chat);
                if (!botOff && getSetting(chat, "xpEnabled") !== false && !ehComando && texto.trim().toLowerCase() !== "prefixo") {
                    try { ganharXP(remetente, chat, texto); } catch (error) { console.error("Erro ao conceder XP:", error); }
                }
            } finally { database.endUsersBatch(); }
        }

        const prefixoAtual = prefixoUsado || prefixoPrincipal;

        const ctx = {
            sock, message: m, chat, sender: remetente, sessionId: opcoes.sessionId || null, args: [], command: null,
            customReactionSent: false,
            customReactionEmoji: null,
            prefix: prefixoAtual, text: texto, level: permissoes.level,
            isOwner: permissoes.owner,
            isMaster: isMaster(remetente) || isMaster(identidade.jid) || isMaster(identidade.lid),
            isAdmin: permissoes.admin, isGroup: chat.endsWith("@g.us"),
            reply(conteudo) { return sendNYX.sendCommandReply(this, conteudo); },
            replyNYX(texto, modo = "user") { return replyNYX(this, texto, modo); },
            react(emoji) {
                const valor = String(emoji || "").trim();
                if (!valor) return Promise.resolve(false);
                this.customReactionSent = true;
                this.customReactionEmoji = valor;
                return sock.sendMessage(chat, { react: { text: valor, key: m.key } });
            },
            delete() { return sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: m.key.fromMe, id: m.key.id, participant: m.key.participant } }); }
        };

        if (buttonId === "runner_menu") { await sendCategoriesMenu(ctx); return; }

        await executarEventos(ctx);

        if (ctx.isGroup) {
            const prefixForAfk = ctx.prefix || prefixoPrincipal;
            const rawText = String(texto || '').trim();
            const commandToken = rawText.startsWith(prefixForAfk) ? rawText.slice(prefixForAfk.length).trim().split(/\s+/)[0].toLowerCase() : '';
            if (!['on', 'off', 'afk'].includes(commandToken)) {
                try {
                    const afk = require('../database/afk');
                    const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || m.message?.documentMessage?.contextInfo || m.message?.stickerMessage?.contextInfo || m.message?.audioStickerMessage?.message?.stickerMessage?.contextInfo || {};
                    const mentioned = Array.isArray(contextInfo.mentionedJid) ? contextInfo.mentionedJid : [];
                    for (const mentionedJid of [...new Set(mentioned)]) {
                        let status = afk.get(mentionedJid) || afk.get(String(mentionedJid).replace(/:\d+@/, '@'));
                        if (!status) {
                            try {
                                const users = require('../utils/users');
                                const user = String(mentionedJid).endsWith('@lid') ? users.getUserByLid(mentionedJid) : users.getUserByJid(mentionedJid);
                                if (user?.jid) status = afk.get(user.jid);
                                if (!status && user?.lid) status = afk.get(user.lid);
                            } catch (_) {}
                        }
                        if (!status) continue;
                        const elapsed = afk.formatDuration(Date.now() - status.since);
                        const reason = status.reason ? `\nMotivo: ${status.reason}` : '';
                        let alvoMencao = mentionedJid;
                        try { alvoMencao = await require('../utils/resolveUser')(sock, chat, mentionedJid); } catch (_) {}
                        const tokenMencao = `@${String(alvoMencao).split('@')[0].split(':')[0]}`;
                        await ctx.replyNYX({ text: `${tokenMencao} está ausente há ${elapsed}.${reason}`, mentions: [alvoMencao] }, 'user');
                    }
                } catch (error) { console.error('Falha ao consultar status AFK:', error.message); }
            }
        }

        await applyAutomaticKeywordReactions(ctx);

        if (chat.endsWith("@g.us")) {
            const textoLower = texto.toLowerCase();
            if (textoLower === "a") texto = `${prefixoPrincipal}abrir`;
            if (textoLower === "f") texto = `${prefixoPrincipal}fechar`;
            if (textoLower === "t") texto = `${prefixoPrincipal}totag`;
            if (textoLower.startsWith("t ")) texto = `${prefixoPrincipal}totag ${texto.slice(2)}`;
        }

        if (!prefixoUsado && texto.trim().toLowerCase() !== "prefixo") await applyAutomaticReplies(ctx, texto);

        if (texto.trim().toLowerCase() === "prefixo") {
            await ctx.replyNYX(`·.♟️:.      『 *${prefixoPrincipal}*  』

ᴘʀᴇꜰɪxᴏ ᴄᴏɴꜰɪɢᴜʀᴀᴅᴏ. ᴏ ʀᴇsᴛᴏ é ᴄᴏɴsᴇǫᴜᴇ̂ɴᴄɪᴀ.`, "user");
            await applyPrefixReaction(ctx);
            return;
        }

        if (/^[sx](?:\d+)?$/.test(texto.toLowerCase())) texto = `${prefixoPrincipal}${texto.toLowerCase()}`;

        let temPrefixo = texto.startsWith(prefixoPrincipal) || (prefixoUsado && texto.startsWith(prefixoUsado));
        if (!temPrefixo && chat.endsWith("@g.us")) {
            const semPrefixo = texto.trim().toLowerCase();
            const primeiroParametro = semPrefixo.split(/\s+/)[0];
            const listaPermitida = security.getNoPrefixList(chat);
            if (listaPermitida.includes(primeiroParametro)) { texto = prefixoPrincipal + texto; temPrefixo = true; }
        }
        if (!temPrefixo) return;

        const tempoComando = getSetting(chat, "tempoComando");
        if (tempoComando && tempoComando > 0 && !isAdmin) {
            const agora = Date.now();
            const ultimoUso = cooldownCache.get(`${chat}_${remetente}`) || 0;
            const tempoPassado = (agora - ultimoUso) / 1000;

            if (tempoPassado < tempoComando) {
                const faltam = Math.ceil(tempoComando - tempoPassado);
                await replyNYX({ sock, chat, message: m, sender: remetente },
                    `⏳ *AGUARDE*\n\nVocê precisa esperar *${faltam}s* para usar outro comando.`,
                    "bot"
                );
                return;
            }
            cooldownCache.set(`${chat}_${remetente}`, agora);
        }

        const prefixoParaCortar = prefixoUsado || prefixoPrincipal;
        const args = texto.slice(prefixoParaCortar.length).trim().split(/\s+/);

        const mapaComandos = {
            "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e", "ғ": "f", "ɢ": "g", "ʜ": "h", "ɪ": "i", "ᴊ": "j", "ᴋ": "k", "ʟ": "l", "ᴍ": "m", "ɴ": "n", "ᴏ": "o", "ᴘ": "p", "ǫ": "q", "ʀ": "r", "ᴛ": "t", "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "ʏ": "y", "ᴢ": "z"
        };

        const comandoRecebido = Array.from(args.shift().toLowerCase(), letra => mapaComandos[letra] ?? letra).join("");
        const atalhoS = comandoRecebido.match(/^s(\d+)?$/);
        const atalhoX = comandoRecebido.match(/^x(\d+)?$/);

        if (atalhoS) ctx.sQuantity = atalhoS[1] ? Number(atalhoS[1]) : 4;
        if (atalhoX) ctx.xQuantity = atalhoX[1] ? Number(atalhoX[1]) : 4;

        const comando = atalhoS ? "s" : atalhoX ? "x" : comandoRecebido;
        ctx.args = args;
        ctx.command = comando;
        updateActivity(remetente, comando);

        if (!ctx.isGroup && !ctx.isOwner) {
            let antiPvLevel = 0;
            try { antiPvLevel = require("../database/securityGroups").getAntiPvLevel(); }
            catch (error) { console.error("Falha ao consultar anti-PV:", error.message); return; }
            if (antiPvLevel === 3) return;
            if (antiPvLevel === 2 && texto.startsWith(ctx.prefix)) return;
            if (antiPvLevel === 1 && texto.startsWith(ctx.prefix)) {
                await ctx.replyNYX("⚠️ O bot está protegido contra uso no privado. Use os comandos no grupo.", "bot");
                return;
            }
        }

        await executarComando(ctx);

    } catch (e) {
        console.log("Erro handler:", e.message);
    }
}

module.exports = handler;
