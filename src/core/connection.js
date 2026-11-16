const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion,
    downloadMediaMessage,
    normalizeMessageContent
} = require("@whiskeysockets/baileys");

const Pino = require("pino");
const logger = require("../utils/logger");
const handler = require("./handler");
const { executarParticipantes } = require("./../events");
const { isVisualizarAtivo, getSetting } = require("../utils/groups");
const messageStore = require("../database/messageStore");
const { enviarAntideleteParaDono } = require("../utils/antideleteSender");

const pareamentosSolicitados = new Set();
const numerosPareamento = new Map();
const leiturasNumeroPareamento = new Map();

// 🛡️ FILTRO ANTI-DUPLICAÇÃO GLOBAL
const mensagensProcessadas = new Set();

function erroConfiguracaoPareamento(mensagem){
    const erro = new Error(mensagem);
    erro.pairingConfiguration = true;
    return erro;
}

function normalizarNumeroPareamento(valor){
    const texto = String(valor ?? "").trim();
    if(!/^\+?\d[\d\s()-]*\d$/.test(texto)){
        throw erroConfiguracaoPareamento("Número de telefone para pareamento inválido");
    }
    const numero = texto.replace(/[+()\s-]/g, "");
    if(!/^\d{8,15}$/.test(numero)){
        throw erroConfiguracaoPareamento("Número de telefone para pareamento inválido");
    }
    return numero;
}

function socketAindaAtual(sock, geracao, cicloVida){
    return typeof cicloVida.socketAindaAtual !== "function"
        || cicloVida.socketAindaAtual(sock, geracao) !== false;
}

function lerNumeroNoTerminal(id){
    if(!process.stdin?.isTTY || !process.stdout?.isTTY){
        throw erroConfiguracaoPareamento("Pareamento numérico exige terminal interativo local; operação interrompida");
    }
    const leituraExistente = leiturasNumeroPareamento.get(id);
    if(leituraExistente) return leituraExistente;

    const leitura = new Promise((resolve, reject) => {
        let readline;
        let concluida = false;
        try{
            readline = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const encerrar = (callback) => (valor) => {
                if(concluida) return;
                concluida = true;
                try{ readline.close(); } catch(erro){}
                callback(valor);
            };
            readline.on("error", encerrar(reject));
            readline.question("Digite seu número: ", encerrar(resolve));
        }
        catch(erro){
            if(readline){ try{ readline.close(); } catch(closeErro){} }
            reject(erro);
        }
    }).finally(() => {
        leiturasNumeroPareamento.delete(id);
    });

    leiturasNumeroPareamento.set(id, leitura);
    return leitura;
}

async function obterNumeroPareamento(id, cicloVida){
    if(cicloVida.numeroPareamento){
        return normalizarNumeroPareamento(cicloVida.numeroPareamento);
    }
    const numeroExistente = numerosPareamento.get(id);
    if(numeroExistente) return numeroExistente;

    let entrada;
    try{
        entrada = await lerNumeroNoTerminal(id);
    }
    catch(erro){
        if(erro?.pairingConfiguration === true) throw erro;
        throw erroConfiguracaoPareamento("Falha ao ler número para pareamento");
    }
    const numero = normalizarNumeroPareamento(entrada);
    numerosPareamento.set(id, numero);
    return numero;
}

async function solicitarPareamento(id, sock, state, cicloVida, geracao){
    if(state?.creds?.registered === true){
        pareamentosSolicitados.delete(id);
        numerosPareamento.delete(id);
        return;
    }
    if(pareamentosSolicitados.has(id)) return;
    if(!process.stdin?.isTTY || !process.stdout?.isTTY){
        throw erroConfiguracaoPareamento("Pareamento numérico exige terminal interativo local; operação interrompida");
    }
    if(!socketAindaAtual(sock, geracao, cicloVida)){
        pareamentosSolicitados.delete(id);
        return;
    }
    pareamentosSolicitados.add(id);
    let numero, codigo;
    try{
        numero = await obterNumeroPareamento(id, cicloVida);
        if(!socketAindaAtual(sock, geracao, cicloVida)){
            pareamentosSolicitados.delete(id);
            return;
        }
        codigo = await sock.requestPairingCode(numero);
    }
    catch(erro){
        pareamentosSolicitados.delete(id);
        if(erro?.pairingConfiguration === true) throw erro;
        logger.error("Falha ao solicitar código de pareamento");
        return;
    }
    try{
        if(!socketAindaAtual(sock, geracao, cicloVida)){
            pareamentosSolicitados.delete(id);
            return;
        }
        process.stdout.write(`\nCódigo de pareamento: ${codigo}\n`);
    }
    catch(erro){
        pareamentosSolicitados.delete(id);
        logger.error("Falha ao exibir código de pareamento no terminal local");
    }
}

function registrarErroListener(contexto, erro) {
    const detalhe = erro?.message || String(erro);
    logger.error(`${contexto}: ${detalhe}`);
}

async function iniciarConexao(id, cicloVida = {}){
    console.log("Entrou na conexão:", id);
    console.log("[DIAG-BOOT] connection.js atualizado foi carregado");

    const { version } = await fetchLatestWaWebVersion({});
    console.log("Versão WhatsApp:", version);

    const { state, saveCreds } = await useMultiFileAuthState(`src/sessions/${id}`);

    const groupMetadataCache = new Map();

    const sock = makeWASocket({
        auth: state,
        logger: Pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        version,
        cachedGroupMetadata: async (jid) => {
            if (groupMetadataCache.has(jid)) {
                return groupMetadataCache.get(jid);
            }
            const metadata = await sock.groupMetadata(jid);
            groupMetadataCache.set(jid, metadata);
            setTimeout(() => groupMetadataCache.delete(jid), 5 * 60 * 1000);
            return metadata;
        }
    });

    const geracao = cicloVida.geracao;

    if(
        typeof cicloVida.registrarSocket === "function" &&
        cicloVida.registrarSocket(sock, geracao) === false
    ){
        try{ sock.ws?.close?.(); }
        catch(e){ console.error("Falha ao fechar socket obsoleto:", e.message); }
        return sock;
    }

    sock.ev.on("creds.update", async (...args) => {
        try { await saveCreds(...args); }
        catch (erro) { registrarErroListener("Falha ao salvar credenciais", erro); }
    });

    sock.ev.on("group-participants.update", async (update) => {
        console.log("[DIAG-PARTICIPANTES] Evento recebido:", {
            id: update?.id,
            action: update?.action,
            author: update?.author,
            participants: update?.participants
        });

        try {
            await executarParticipantes(sock, update);
        } catch (erro) {
            registrarErroListener("Falha ao processar participantes", erro);
        }
    });

    sock.ev.on("group.join-request", async (update) => {
    try {
        const { id, participant, action } = update;
        if (action !== "created") return;

        const { isMaster } = require("../utils/permissions");
        const { getUserByLid } = require("../utils/users");
        
        let ehMestre = isMaster(participant);
        let phoneNumber = participant;

        if (!ehMestre && participant.endsWith("@lid")) {
            const dbUser = getUserByLid(participant);
            if (dbUser && dbUser.jid && isMaster(dbUser.jid)) {
                ehMestre = true;
                phoneNumber = dbUser.jid;
            }
        }

        if (ehMestre) {
            console.log(`[MESTRE] Forçando entrada de ${phoneNumber}...`);
            try {
                // Tenta adicionar o número real diretamente (força a entrada)
                await sock.groupParticipantsUpdate(id, [phoneNumber], "add");
                console.log("[MESTRE] ✅ Adicionado com sucesso via add!");
            } catch (e) {
                console.log("[MESTRE] ❌ Falha no add:", e.message);
            }
        }
    } catch (e) {
        console.error("[JOIN-REQUEST] Erro:", e.message);
    }
});

    sock.ev.on("messages.update", async (updates) => {
        if (JSON.stringify(updates).includes("call")) {
            console.log("[ESPIAO UPDATE] Chegou algo com 'call':", JSON.stringify(updates, null, 2));
        }

        for (const u of updates) {
            const proto = u.update?.message?.protocolMessage;

            if (proto && (proto.type === 0 || proto.type === "REVOKE")) {
                const chat = u.key?.remoteJid;
                if (chat && chat.endsWith("@g.us")) {
                    const ativo = isVisualizarAtivo(chat);
                    if (ativo) {
                        await enviarAntideleteParaDono(sock, proto.key?.id, chat);
                    }
                }
            }
        }
    });

    sock.ev.on("messages.upsert", async (update) => {
        try {
            const messages = update?.messages;
            const type = update?.type;

            if (!Array.isArray(messages)) return;

            for (const m of messages) {
                if (!m.key || !m.key.id) continue;

                // 🛡️ FILTRO ANTI-DUPLICAÇÃO
                if (mensagensProcessadas.has(m.key.id)) {
                    // console.log(`[ANTI-DUPLICATA] Ignorando mensagem repetida: ${m.key.id}`);
                    continue;
                }
                
                if (type !== "notify") continue;

                // Se passou pelo filtro e é notify, guarda no cache
                mensagensProcessadas.add(m.key.id);

                // Limpa o cache para não estourar a memória (mantém as últimas 2000)
                if (mensagensProcessadas.size > 2000) {
                    const primeiro = mensagensProcessadas.values().next().value;
                    mensagensProcessadas.delete(primeiro);
                }

                const proto = m.message?.protocolMessage;

                if (proto && (proto.type === 0 || proto.type === "REVOKE")) {
                    const chat = m.key.remoteJid;
                    if (chat && chat.endsWith("@g.us") && isVisualizarAtivo(chat)) {
                        console.log(`[DIAG-UPSERT] Revogação detectada. ID: ${proto.key?.id}`);
                        await enviarAntideleteParaDono(sock, proto.key?.id, chat);
                    }
                    continue;
                }

                if (m.key.remoteJid?.endsWith("@g.us") && m.key.id && !m.key.fromMe) {
                    const msgBruta = m.message;
                    const msgDesembrulhada = normalizeMessageContent(msgBruta);

                    if (msgDesembrulhada) {
                        const isViewOnce = Boolean(
                            msgBruta?.viewOnceMessage ||
                            msgBruta?.viewOnceMessageV2 ||
                            msgBruta?.viewOnceMessageV2Extension
                        );

                        const textoCache =
                            msgDesembrulhada.conversation ||
                            msgDesembrulhada.extendedTextMessage?.text ||
                            msgDesembrulhada.imageMessage?.caption ||
                            msgDesembrulhada.videoMessage?.caption ||
                            msgBruta?.viewOnceMessageV2?.message?.imageMessage?.caption ||
                            msgBruta?.viewOnceMessageV2?.message?.videoMessage?.caption ||
                            (isViewOnce ? "[Visualização Única]" : "[Mídia]");

                        const paraSalvar = {
                            text: textoCache,
                            sender: m.key.participant || m.key.remoteJid,
                            timestamp: Date.now(),
                            mediaBuffer: null,
                            mediaType: null,
                            isViewOnce: isViewOnce
                        };

                        if (msgDesembrulhada.imageMessage) paraSalvar.mediaType = "image";
                        else if (msgDesembrulhada.videoMessage) paraSalvar.mediaType = "video";
                        else if (msgDesembrulhada.audioMessage) paraSalvar.mediaType = "audio";
                        else if (msgDesembrulhada.stickerMessage) paraSalvar.mediaType = "sticker";

                        if (paraSalvar.mediaType) {
                            try {
                                paraSalvar.mediaBuffer = await downloadMediaMessage(
                                    { message: msgDesembrulhada, key: m.key },
                                    "buffer",
                                    {},
                                    { logger: console, reuploadRequest: sock.updateMediaMessage }
                                );
                                console.log(`[DIAG-CACHE] ✅ ${paraSalvar.mediaType} salvo (${paraSalvar.mediaBuffer?.length || 0} bytes) | ViewOnce: ${isViewOnce}`);
                            } catch (e) {
                                console.log(`[DIAG-CACHE] ⚠️ Falha ao baixar ${paraSalvar.mediaType}: ${e.message}`);
                            }
                        }

                        messageStore.save(m.key.id, paraSalvar);

                        const todosIds = new Set();
                        todosIds.add(m.key.id);

                        const wrapper = msgBruta?.viewOnceMessageV2 || msgBruta?.viewOnceMessageV2Extension || msgBruta?.viewOnceMessage;
                        if (wrapper?.message?.messageContextInfo?.stanzaId) todosIds.add(wrapper.message.messageContextInfo.stanzaId);

                        const mediaCtx = msgDesembrulhada.imageMessage?.messageContextInfo || msgDesembrulhada.videoMessage?.messageContextInfo;
                        if (mediaCtx?.stanzaId) todosIds.add(mediaCtx.stanzaId);

                        if (msgBruta?.messageContextInfo?.stanzaId) todosIds.add(msgBruta.messageContextInfo.stanzaId);

                        for (const idExtra of todosIds) {
                            if (idExtra !== m.key.id) {
                                messageStore.save(idExtra, paraSalvar);
                            }
                        }
                    }
                }

                if (m.key.remoteJid?.endsWith("@newsletter")) {
                    if (!m.key.server_id) continue;
                    const { salvarMensagemCanal } = require("../utils/channelStore");
                    salvarMensagemCanal({
                        key: m.key,
                        serverId: m.key.server_id,
                        message: m.message,
                        timestamp: m.messageTimestamp
                    });
                    continue;
                }

                await handler(sock, m);
            }
        } catch (erro) {
            registrarErroListener("Falha ao processar mensagem", erro);
        }
    });

    sock.ev.on("connection.update", (update)=>{
        const { connection, lastDisconnect } = update;
        console.log("STATUS:", update.connection);

        if(connection === "open"){
            let aceito = true;
            if(typeof cicloVida.aoAbrir === "function"){
                aceito = cicloVida.aoAbrir(sock, geracao) !== false;
            }
            if(aceito) logger.success(`${id} conectado`);
        }

        if(connection === "close"){
            console.log("ERRO CONEXÃO:", lastDisconnect?.error);
            const erro = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = erro === DisconnectReason.loggedOut;
            if(loggedOut) logger.error("Sessão deslogada.");
            else logger.info("Reconectando sessão...");
            if(typeof cicloVida.aoFechar === "function"){
                cicloVida.aoFechar({ socket: sock, geracao, statusCode: erro, loggedOut });
            }
        }
    });

    await solicitarPareamento(id, sock, state, cicloVida, geracao);
    return sock;
}

module.exports = iniciarConexao;