const { getBotName } = require("./botNameStore");
const config = require("../config/config");
const sendNYX = require("./sendNYX");
const { pegarNome } = require("./contactCache");
const { getUser } = require("./users");
const x9 = require("./x9");

function hora() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

module.exports = {
    info(text) {
        console.log(`[${hora()}] [INFO] ${text}`);
    },

    success(text) {
        console.log(`[${hora()}] [ONLINE] ${text}`);
    },

    error(text) {
        console.log(`[${hora()}] [ERRO] ${text}`);
    },

    async action(sock, dados) {
        try {
            // Se as logs globais estiverem desligadas, nem tenta
            if (!config.logsChat) return;

            // =========================================
            // TRAVA DO X9 (BLOQUEIO IMEDIATO)
            // =========================================
            // Se for uma ação de grupo e o X9 não estiver ativo, aborta sem nem pensar.
            if (dados.grupo && !x9.status(dados.grupo)) {
                return; 
            }

            // =========================================
            // BUSCA DADOS DO EXECUTOR E ALVO
            // =========================================
            const executorUser = dados.executor ? getUser(dados.executor) : null;
            const nomeExecutor = executorUser?.name || pegarNome(dados.executor) || dados.executor?.split("@")[0] || "Sistema";

            const alvoUser = dados.alvo ? getUser(dados.alvo) : null;
            const nomeAlvo = alvoUser?.name || pegarNome(dados.alvo) || dados.alvo?.split("@")[0] || "N/A";

            const mentions = [];
            if (dados.executor) mentions.push(dados.executor);
            if (dados.alvo) mentions.push(dados.alvo);

            // =========================================
            // ENVIA LOG COM LAYOUT NYX
            // =========================================
            const textoLog = 
`╔═━✰『 🔒 sᴇᴄᴜʀɪᴛʏ ʟᴏɢ 』═━✰

║╎⊹ ࣪ ˖ ⚡ ▸ ᴇᴠᴇɴᴛᴏ ᴅᴇᴛᴇᴄᴛᴀᴅᴏ
║╎⊹ ࣪ ˖ 📌 ▸ ᴀçãᴏ: *${dados.acao}*
║╎⊹ ࣪ ˖ 👮 ▸ ᴇxᴇᴄᴜᴛᴏʀ: @${dados.executor ? dados.executor.split("@")[0] : "N/A"}
║╎⊹ ࣪ ˖ 🎯 ▸ ᴀʟᴠᴏ: @${dados.alvo ? dados.alvo.split("@")[0] : "N/A"}
║╎⊹ ࣪ ˖ 🌐 ▸ ɢʀᴜᴘᴏ: ${dados.grupo || "N/A"}
║╎⊹ ࣪ ˖ 🕒 ▸ ʜᴏʀᴀ: *${hora()}*

╚═━═━═━═━ ᴅᴇᴠ ᴇᴢ ━═━═━═━✰`;

            // Usando o sendNYX direto (que já tem o "Ver canal" embutido)
            await sendNYX(
                sock,
                config.logsChat,
                textoLog,
                null,
                mentions
            );

        } catch (e) {
            console.log("Erro enviando log:", e.message);
        }
    }
};